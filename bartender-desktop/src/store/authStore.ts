import { create } from "zustand";

import { login as loginService, getMe } from "../modules/auth/services/authService";
import type { User } from "../types/auth";

import { saveTokens, removeTokens, getAccessToken, getRefreshToken } from "../utils/tokenStorage";
import { setAuthToken } from "../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
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

    // Guardar ambos tokens por separado
    saveTokens(response.token, response.refreshToken || response.token);
    setAuthToken(response.token);

    set({
      user: response.user,
      token: response.token,
      refreshToken: response.refreshToken || response.token,
      isAuthenticated: true,
    });
  },

  /* =========================
     LOGOUT
  ========================= */
  logout: () => {
    removeTokens();
    setAuthToken(null);

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
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
      // Usar access token si existe
      if (accessToken) {
        setAuthToken(accessToken);
      }

      //  VALIDACIÓN REAL DEL TOKEN
      const user = await getMe();

      set({
        token: accessToken,
        refreshToken: refreshToken,
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      // token inválido o expirado, intentar refresh
      if (refreshToken) {
        try {
          const api = (await import("../services/api")).default;
          const response: any = await api.post('/auth/refresh', { refreshToken });
          
          const newAccessToken = response?.token;
          const newRefreshToken = response?.refreshToken || refreshToken;

          if (newAccessToken) {
            saveTokens(newAccessToken, newRefreshToken);
            setAuthToken(newAccessToken);

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
      setAuthToken(null);

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