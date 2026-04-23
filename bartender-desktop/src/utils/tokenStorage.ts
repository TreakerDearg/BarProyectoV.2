const TOKEN_KEY = "bartender_token";

/* =========================================================
   SAVE TOKEN
   - Guarda token de forma segura
   - Normaliza input
========================================================= */
export const saveToken = (token: string) => {
  if (!token) return;

  localStorage.setItem(TOKEN_KEY, token);
};

/* =========================================================
   GET TOKEN
   - Acceso seguro
========================================================= */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/* =========================================================
   REMOVE TOKEN
   - Limpieza completa de auth
========================================================= */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/* =========================================================
   CHECK AUTH
   - Utilidad clave para guards del frontend
========================================================= */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};