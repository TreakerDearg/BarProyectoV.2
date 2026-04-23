import api from "../../../services/api";
import type { AuthResponse, LoginData, User } from "../../../types/auth";

/* =========================================================
   LOGIN
   - Maneja errores correctamente
   - Devuelve respuesta tipada
========================================================= */
export const login = async (
  credentials: LoginData
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Error al iniciar sesión";

    // IMPORTANTE: no pierdas contexto del backend
    throw new Error(message);
  }
};

/* =========================================================
   GET CURRENT USER (ME)
   - Usado para auto-login y refresh de sesión
========================================================= */
export const getMe = async (): Promise<User> => {
  try {
    const { data } = await api.get<User>("/auth/me");
    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        "No se pudo obtener el usuario"
    );
  }
};

/* =========================================================
   LOGOUT
   - Backend opcional (JWT es stateless)
   - Siempre debe funcionar aunque falle API
========================================================= */
export const logoutRequest = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // silencioso intencional:
    // logout local nunca debe fallar
    console.warn("Logout backend error (ignored)");
  }
};