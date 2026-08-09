const ACCESS_TOKEN_KEY = "bartender_access_token";
const REFRESH_TOKEN_KEY = "bartender_refresh_token";

/* =========================================================
   SAVE TOKENS
   - Guarda access token y refresh token por separado
========================================================= */
export const saveTokens = (accessToken: string, refreshToken: string) => {
  try {
    if (!accessToken) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (error) {
    console.error('[TokenStorage] Error saving tokens:', error);
  }
};

/* =========================================================
   SAVE TOKEN (legacy - mantiene compatibilidad)
========================================================= */
export const saveToken = (token: string) => {
  try {
    if (!token) return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('[TokenStorage] Error saving token:', error);
  }
};

/* =========================================================
   GET ACCESS TOKEN
   - Obtiene el access token para peticiones API
========================================================= */
export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Error getting access token:', error);
    return null;
  }
};

/* =========================================================
   GET REFRESH TOKEN
   - Obtiene el refresh token para renovación
========================================================= */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Error getting refresh token:', error);
    return null;
  }
};

/* =========================================================
   GET TOKEN (legacy - mantiene compatibilidad)
========================================================= */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Error getting token:', error);
    return null;
  }
};

/* =========================================================
   REMOVE TOKENS
   - Limpieza completa de auth
========================================================= */
export const removeTokens = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Error removing tokens:', error);
  }
};

/* =========================================================
   REMOVE TOKEN (legacy - mantiene compatibilidad)
========================================================= */
export const removeToken = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Error removing token:', error);
  }
};

/* =========================================================
   CHECK AUTH
   - Utilidad clave para guards del frontend
========================================================= */
export const isAuthenticated = (): boolean => {
  try {
    return !!getAccessToken() || !!getRefreshToken();
  } catch (error) {
    console.error('[TokenStorage] Error checking auth:', error);
    return false;
  }
};