import { api } from "../../../services/api";
import type { AuthResponse, LoginData } from "../../../types/auth";

export const login = async (
  credentials: LoginData
): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};