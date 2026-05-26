const PROD_FALLBACK_BACKEND = "https://barproyectov-2.onrender.com";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function resolveBackendBaseUrl(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (backendUrl) return stripTrailingSlash(backendUrl);

  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (apiUrl) return stripTrailingSlash(apiUrl.replace(/\/api\/?$/i, ""));

  if (import.meta.env.DEV) return "http://localhost:5000";
  return PROD_FALLBACK_BACKEND;
}

export function resolveTrackingSocketUrl(): string {
  return `${resolveBackendBaseUrl()}/tracking`;
}
