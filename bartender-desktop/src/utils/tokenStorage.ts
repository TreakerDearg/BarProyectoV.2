const ACCESS_TOKEN_KEY = "bartender_access_token";
const REFRESH_TOKEN_KEY = "bartender_refresh_token";

/* =========================================================
   SAVE TOKENS
   - Guarda access token y refresh token por separado
========================================================= */
export const saveTokens = (accessToken: string, refreshToken: string) => {
  if (!accessToken) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/* =========================================================
   SAVE TOKEN (legacy - mantiene compatibilidad)
========================================================= */
export const saveToken = (token: string) => {
  if (!token) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/* =========================================================
   GET ACCESS TOKEN
   - Obtiene el access token para peticiones API
========================================================= */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/* =========================================================
   GET REFRESH TOKEN
   - Obtiene el refresh token para renovación
========================================================= */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/* =========================================================
   GET TOKEN (legacy - mantiene compatibilidad)
========================================================= */
export const getToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/* =========================================================
   REMOVE TOKENS
   - Limpieza completa de auth
========================================================= */
export const removeTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/* =========================================================
   REMOVE TOKEN (legacy - mantiene compatibilidad)
========================================================= */
export const removeToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/* =========================================================
   CHECK AUTH
   - Utilidad clave para guards del frontend
========================================================= */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken() || !!getRefreshToken();
};