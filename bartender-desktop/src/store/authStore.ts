import { create } from "zustand";

import { login as loginService, getMe } from "../modules/auth/services/authService";
import type { User } from "../types/auth";

import { saveTokens, removeTokens, getAccessToken, getRefreshToken } from "../utils/tokenStorage";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  setAuth: (token: string, user: User, refreshToken?: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,

  /* =========================
     LOGIN
  ========================= */
  login: async (email, password) => {
    const response = await loginService({ email, password });
    const token = response.token;
    const refreshToken = response.refreshToken;
    const rawUser = response.user;

    if (!token || !rawUser) {
      throw new Error("No se pudo iniciar sesión");
    }

    const role = rawUser.role;
    if (role === "client") {
      throw new Error("Esta cuenta es de cliente. Iniciá sesión en la web del bar.");
    }

    const user = {
      ...rawUser,
      _id: rawUser._id,
      role,
    };

    saveTokens(token, refreshToken || token);

    set({
      user,
      token,
      refreshToken: refreshToken || token,
      isAuthenticated: true,
    });
  },

  /* =========================
     LOGOUT
  ========================= */
  logout: () => {
    removeTokens();

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  /* =========================
     SET AUTH (OAUTH CALLBACK)
  ========================= */
  setAuth: (token: string, user: User, refreshToken?: string) => {
    // Guardar ambos tokens — el refreshToken puede venir del callback OAuth
    saveTokens(token, refreshToken || token);

    set({
      user,
      token,
      refreshToken: refreshToken || token,
      isAuthenticated: true,
    });
  },

  /* =========================
     INIT (AUTO LOGIN REAL)
  ========================= */
  initialize: async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!accessToken && !refreshToken) {
      set({ loading: false });
      return;
    }

    try {
      //  VALIDACIÓN REAL DEL TOKEN
      const user = await getMe();

      set({
        token: accessToken,
        refreshToken: refreshToken,
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      // token inválido o expirado, intentar refresh
      if (refreshToken) {
        try {
          const api = (await import("../services/api")).default;
          const response = await api.post<{ token?: string; refreshToken?: string }>('/auth/refresh', { refreshToken });
          const payload = response.data;
          const newAccessToken = payload.token;
          const newRefreshToken = payload.refreshToken || refreshToken;

          if (newAccessToken) {
            saveTokens(newAccessToken, newRefreshToken);
            saveTokens(newAccessToken, newRefreshToken);

            const user = await getMe();
            set({
              token: newAccessToken,
              refreshToken: newRefreshToken,
              user,
              isAuthenticated: true,
              loading: false,
            });
            return;
          }
        } catch (refreshError) {
          console.error('Error al renovar token:', refreshError);
        }
      }

      // Si falla todo, limpiar
      removeTokens();
      removeTokens();

      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },
}));