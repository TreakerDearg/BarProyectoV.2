import api from "../../../services/api";
import type { AuthResponse, LoginData, User } from "../../../types/auth";

/* =========================
   LOGIN
========================= */
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
    throw new Error(
      error?.response?.data?.message || "Error al iniciar sesión"
    );
  }
};

/* =========================
   GET CURRENT USER
   (clave para auto-login)
========================= */
export const getMe = async (): Promise<User> => {
  try {
    const { data } = await api.get<User>("/auth/me");
    return data;
  } catch (error: any) {
    throw new Error("No se pudo obtener el usuario");
  }
};

/* =========================
   LOGOUT (backend opcional)
========================= */
export const logoutRequest = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // silencioso (logout siempre debe funcionar local)
  }
};