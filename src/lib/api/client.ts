import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { getAccessToken, saveAccessToken, saveRefreshToken, clearTokens } from "../auth/tokenStorage";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  validateStatus: (s) => s < 500,
});

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Suscribe una petición pendiente al refresh de token
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Notifica a todas las peticiones pendientes que el token fue renovado
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

/**
 * Obtiene el access token desde localStorage
 */
function getAccessTokenFromStorage(): string | null {
  return getAccessToken();
}

api.interceptors.request.use((config) => {
  const token = getAccessTokenFromStorage();
  
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

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Si el error es 401 y no hemos intentado reintentar
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya estamos refrescando, suscribir esta petición
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('bartender_refresh_token');
        
        if (!refreshToken) {
          // No hay refresh token, limpiar todo
          clearTokens();
          window.dispatchEvent(new Event('auth:logout'));
          return Promise.reject(error);
        }

        // Intentar renovar el token
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        // Guardar nuevos tokens
        saveAccessToken(token);
        saveRefreshToken(newRefreshToken);

        // Actualizar header de la petición original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        // Notificar a todas las peticiones pendientes
        onTokenRefreshed(token);

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Error al renovar, limpiar todo
        clearTokens();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function errMessage(err: unknown): string {
  const ax = err as AxiosError<{ message?: string }>;
  return ax.response?.data?.message ?? ax.message ?? "Error de red";
}
