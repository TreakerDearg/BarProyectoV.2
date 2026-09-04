const PROD_FALLBACK_BACKEND = "https://barproyectov-2.onrender.com";
const DEFAULT_BACKEND_PORT = "5000";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getBrowserBackendUrl(): string | null {
  if (typeof window === "undefined") return null;

  const { protocol, hostname } = window.location;
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return null;
  }

  const port = import.meta.env.VITE_BACKEND_PORT?.trim() || DEFAULT_BACKEND_PORT;
  const safeProtocol = protocol === "https:" ? "https:" : "http:";
  return `${safeProtocol}//${hostname}:${port}`;
}

export function resolveBackendBaseUrl(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (backendUrl) return stripTrailingSlash(backendUrl);

  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (apiUrl) return stripTrailingSlash(apiUrl.replace(/\/api\/?$/i, ""));

  const browserBackendUrl = getBrowserBackendUrl();
  if (browserBackendUrl) return browserBackendUrl;

  if (import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_BACKEND === "true") {
    return `http://localhost:${DEFAULT_BACKEND_PORT}`;
  }

  return PROD_FALLBACK_BACKEND;
}

export function resolveApiBaseUrl(): string {
  return `${resolveBackendBaseUrl()}/api`;
}

export function resolveTrackingSocketUrl(): string {
  return `${resolveBackendBaseUrl()}/tracking`;
}
