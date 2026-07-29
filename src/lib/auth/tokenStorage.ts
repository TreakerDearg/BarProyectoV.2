/* =========================================================
   TOKEN STORAGE (WEB)
   Gestión centralizada de tokens para el frontend Web
   Compartido entre Axios interceptors y Zustand store
========================================================= */

const ACCESS_TOKEN_KEY = 'bartender_access_token';
const REFRESH_TOKEN_KEY = 'bartender_refresh_token';

/**
 * Guarda el access token
 */
export const saveAccessToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

/**
 * Guarda el refresh token
 */
export const saveRefreshToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * Obtiene el access token
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Obtiene el refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Elimina todos los tokens
 */
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
