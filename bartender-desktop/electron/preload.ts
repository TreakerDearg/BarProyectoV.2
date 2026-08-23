import { contextBridge, ipcRenderer } from "electron";

/**
 * API segura expuesta al frontend (renderer process).
 * Toda comunicación con el main process pasa por aquí.
 */
contextBridge.exposeInMainWorld("electronAPI", {
  // ── Info del sistema ──────────────────────────────────────
  system: {
    platform: process.platform,
    versions: {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
    },
  },

  // ── IPC — comunicación bidireccional ─────────────────────
  ipc: {
    send: (channel: string, data?: unknown) => {
      const validChannels = ["app:quit", "log:message"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },

    invoke: (channel: string, data?: unknown) => {
      const validChannels = ["get:appVersion", "get:data", "open:external"];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      return Promise.reject(new Error("Canal no permitido"));
    },

    on: (channel: string, callback: (...args: any[]) => void) => {
      const validChannels = ["from:main", "auth:sso"];
      if (validChannels.includes(channel)) {
        // Wrappear para evitar exponer el event de Electron
        const wrapped = (_: Electron.IpcRendererEvent, ...args: any[]) =>
          callback(...args);
        ipcRenderer.on(channel, wrapped);
        // Devolver función de cleanup
        return () => ipcRenderer.removeListener(channel, wrapped);
      }
      return () => {};
    },

    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },

  // ── SSO: escuchar el deep link bartender://auth?t=<token> ─
  // El main process emite "auth:sso" cuando recibe el deep link
  sso: {
    onToken: (callback: (payload: {
      success: boolean;
      token?: string;
      refreshToken?: string;
      user?: { _id: string; name: string; email: string; role: string; isEmployee?: boolean; shift?: string | null };
      error?: string;
    }) => void) => {
      const wrapped = (_: Electron.IpcRendererEvent, payload: any) =>
        callback(payload);
      ipcRenderer.on("auth:sso", wrapped);
      return () => ipcRenderer.removeListener("auth:sso", wrapped);
    },
  },

  // ── Utilidades ────────────────────────────────────────────
  utils: {
    log: (message: string) => {
      ipcRenderer.send("log:message", message);
    },
    openExternal: (url: string) => {
      return ipcRenderer.invoke("open:external", url);
    },
  },
});
