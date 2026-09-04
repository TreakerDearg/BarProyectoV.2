import { app, BrowserWindow, ipcMain } from "electron";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const isDev = !app.isPackaged;
const PROD_API_FALLBACK = "https://barproyectov-2.onrender.com/api";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveApiBaseUrl(): string {
  const explicitApiUrl = process.env.VITE_API_URL?.trim();
  if (explicitApiUrl) return stripTrailingSlash(explicitApiUrl);

  const explicitBackendUrl = process.env.VITE_BACKEND_URL?.trim();
  if (explicitBackendUrl) return `${stripTrailingSlash(explicitBackendUrl)}/api`;

  if (isDev && process.env.VITE_USE_LOCAL_BACKEND === "true") {
    return "http://localhost:5000/api";
  }

  return PROD_API_FALLBACK;
}

// ── Custom protocol: bartender://
// Permite que la web abra el desktop con un SSO token.
// En producción electron-builder registra el protocolo via build.protocols.
// En desarrollo funciona en macOS/Linux con setAsDefaultProtocolClient.
// En Windows dev se maneja via second-instance.
app.setAsDefaultProtocolClient("bartender");

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// ── Deep link handler (macOS / Linux)
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// ── Deep link handler (Windows — single-instance lock)
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    // argv en Windows incluye la URL del protocolo como último argumento
    const url = argv.find((arg) => arg.startsWith("bartender://"));
    if (url) handleDeepLink(url);

    // Traer la ventana al frente
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/**
 * Procesa un deep link del tipo:
 *   bartender://auth?t=<ssoToken>
 *
 * Canjea el SSO token contra el backend y envía los tokens
 * al renderer vía IPC para que pueda hacer auto-login.
 */
async function handleDeepLink(url: string) {
  try {
    const parsed = new URL(url);

    // Solo procesar bartender://auth
    if (parsed.hostname !== "auth") return;

    const ssoToken = parsed.searchParams.get("t");
    if (!ssoToken) return;

    // Canjear el SSO token contra el backend
    const apiBase = resolveApiBaseUrl();

    const response = await fetch(`${apiBase}/auth/sso-token/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssoToken }),
    });

    const data = await response.json();

    if (!data.success || !data.data?.token) {
      // Token inválido o expirado — notificar al renderer
      mainWindow?.webContents.send("auth:sso", {
        success: false,
        error: data.message || "Token SSO inválido o expirado",
      });
      return;
    }

    // Enviar tokens al renderer para que complete el login
    mainWindow?.webContents.send("auth:sso", {
      success: true,
      token: data.data.token,
      refreshToken: data.data.refreshToken,
      user: data.data.user,
    });
  } catch (err) {
    console.error("[Electron] Error al procesar deep link:", err);
    mainWindow?.webContents.send("auth:sso", {
      success: false,
      error: "Error al procesar la autenticación SSO",
    });
  }
}

// ── IPC: el renderer puede pedir al main que abra una URL externa
ipcMain.handle("open:external", async (_event, url: string) => {
  const { shell } = await import("electron");
  await shell.openExternal(url);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
