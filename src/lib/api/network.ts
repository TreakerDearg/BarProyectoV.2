const PROD_API_FALLBACK = "https://barproyectov-2.onrender.com/api";
const PROD_EMPLOYEE_SYSTEM_FALLBACK = "https://bar-proyecto-v-2-xst7.vercel.app";
const DEFAULT_BACKEND_PORT = "5000";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function ensureApiSuffix(value: string): string {
  const normalized = stripTrailingSlash(value.trim());
  return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
}

function isHostedPreview(hostname: string): boolean {
  return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
}

function getBrowserLanApiUrl(): string | null {
  if (typeof window === "undefined") return null;

  const { protocol, hostname } = window.location;
  if (!hostname || isHostedPreview(hostname)) return null;

  const port = process.env.NEXT_PUBLIC_API_PORT || DEFAULT_BACKEND_PORT;
  const safeProtocol = protocol === "https:" ? "https:" : "http:";
  return `${safeProtocol}//${hostname}:${port}/api`;
}

export function resolveApiBaseUrl(): string {
  const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicitApiUrl) return ensureApiSuffix(explicitApiUrl);

  const explicitBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (explicitBackendUrl) return ensureApiSuffix(explicitBackendUrl);

  const browserApiUrl = getBrowserLanApiUrl();
  if (browserApiUrl) return browserApiUrl;

  return PROD_API_FALLBACK;
}

export function resolveSocketBaseUrl(): string {
  return resolveApiBaseUrl().replace(/\/api$/i, "");
}

export function resolveEmployeeSystemUrl(destination = ""): string {
  const explicitUrl = process.env.NEXT_PUBLIC_DESKTOP_URL?.trim()
    || process.env.NEXT_PUBLIC_EMPLOYEE_SYSTEM_URL?.trim()
    || PROD_EMPLOYEE_SYSTEM_FALLBACK;

  const baseUrl = stripTrailingSlash(explicitUrl);
  if (/^https?:\/\//i.test(destination)) return destination;

  const destinationQuery = destination.includes("?")
    ? destination.slice(destination.indexOf("?"))
    : "";

  return `${baseUrl}${destinationQuery}`;
}
