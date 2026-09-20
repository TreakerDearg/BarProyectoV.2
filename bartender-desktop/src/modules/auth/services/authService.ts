import api from "../../../services/api";
import type { AuthResponse, LoginData, User } from "../../../types/auth";

/* =========================================================
   ERROR NORMALIZER
========================================================= */
interface AuthRequestError {
  message?: string;
  response?: { data?: { message?: string } };
}

const getErrorMessage = (error: unknown): string => {
  const details = error as AuthRequestError;
  return details.response?.data?.message || details.message || "Error inesperado";
};

/* =========================================================
   LOGIN
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
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
};

/* =========================================================
   GET CURRENT USER
========================================================= */
export const getMe = async (): Promise<User> => {
  try {
    const { data } = await api.get<User>("/auth/me");
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
};

/* =========================================================
   LOGOUT (SAFE)
========================================================= */
export const logoutRequest = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch {
    // logout nunca debe romper UI
    console.warn("Logout backend error ignored");
  }
};