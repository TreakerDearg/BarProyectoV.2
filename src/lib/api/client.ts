import axios, { type AxiosError } from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  validateStatus: (s) => s < 500,
});

function tokenFromPersist(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("bartender-client");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = tokenFromPersist();
  
  if (!config.headers) {
    config.headers = {} as any;
  }
  config.headers['Accept'] = 'application/json, text/plain, */*';
  config.headers['Content-Type'] = 'application/json';
  config.headers['X-Platform'] = 'web';
  config.headers['X-Client-Version'] = '1.0.0';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function errMessage(err: unknown): string {
  const ax = err as AxiosError<{ message?: string }>;
  return ax.response?.data?.message ?? ax.message ?? "Error de red";
}
