import { logger } from "./logger.js";

const DEFAULT_CLIENT_PORTS = ["3000", "5173"];
const VERCEL_PREVIEW_RE = /^https:\/\/[a-z0-9-]+(\-[a-z0-9-]+)*\.vercel\.app$/i;

function parseCsv(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isPrivateHostname(hostname = "") {
  const clean = hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (clean === "localhost" || clean === "::1") return true;
  if (/^127\./.test(clean)) return true;
  if (/^10\./.test(clean)) return true;
  if (/^192\.168\./.test(clean)) return true;

  const match172 = clean.match(/^172\.(\d{1,2})\./);
  if (match172) {
    const second = Number(match172[1]);
    return second >= 16 && second <= 31;
  }

  return clean.endsWith(".local");
}

export function getServerBindHost() {
  return process.env.HOST || "0.0.0.0";
}

export function getAllowedOrigins() {
  return new Set(
    [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      // Producción: cliente web y desktop
      "https://bar-proyecto-v-2-xst7.vercel.app",  // cliente
      "https://bar-proyecto-v-2.vercel.app",        // desktop
      "https://barproyectov-2.onrender.com",
      process.env.CLIENT_URL,
      process.env.CLIENT_WEB_URL,
      process.env.DESKTOP_URL,
      ...parseCsv(process.env.ALLOWED_ORIGINS || ""),
    ].filter(Boolean)
  );
}

export function isVercelPreviewOrigin(origin = "") {
  return VERCEL_PREVIEW_RE.test(origin);
}

export function isAllowedPrivateNetworkOrigin(origin = "") {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.ALLOW_PRIVATE_NETWORK_ORIGINS === "false") return false;

  try {
    const url = new URL(origin);
    const configuredPorts = parseCsv(process.env.ALLOWED_LOCAL_ORIGIN_PORTS || "");
    const allowedPorts = configuredPorts.length ? configuredPorts : DEFAULT_CLIENT_PORTS;
    const port = url.port || (url.protocol === "https:" ? "443" : "80");

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      allowedPorts.includes(port) &&
      isPrivateHostname(url.hostname)
    );
  } catch {
    return false;
  }
}

export function isAllowedOrigin(origin, allowedOrigins = getAllowedOrigins()) {
  return (
    allowedOrigins.has(origin) ||
    isVercelPreviewOrigin(origin) ||
    isAllowedPrivateNetworkOrigin(origin)
  );
}

export function corsOriginCallback(origin, callback) {
  if (!origin) return callback(null, true);
  if (isAllowedOrigin(origin)) return callback(null, true);

  logger.warn(`[CORS] Bloqueado: ${origin}`);
  return callback(new Error(`CORS bloqueado: ${origin}`));
}
