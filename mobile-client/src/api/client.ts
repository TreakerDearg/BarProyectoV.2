import axios, { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// URL por defecto (Producción Render o emulador local)
const DEFAULT_URL = Platform.select({
  android: "https://barproyectov-2.onrender.com/api",
  ios: "https://barproyectov-2.onrender.com/api",
  default: "https://barproyectov-2.onrender.com/api",
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Platform": "mobile",
    "X-Client-Version": "1.0.0",
  },
  timeout: 15000,
});

// Interceptor para agregar token si existe
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn("[Auth] No se pudo leer el token:", error);
  }
  return config;
});

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      return String(data.message);
    }
    return err.message || "Error en la conexión con el servidor";
  }
  return err instanceof Error ? err.message : "Error desconocido";
}
