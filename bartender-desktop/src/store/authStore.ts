import { create } from "zustand";

import { login as loginService, getMe } from "../modules/auth/services/authService";
import type { User } from "../types/auth";

import { saveToken, removeToken, getToken } from "../utils/tokenStorage";
import { setAuthToken } from "../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,

  /* =========================
     LOGIN
  ========================= */
  login: async (email, password) => {
    const response = await loginService({ email, password });

    saveToken(response.token);
    setAuthToken(response.token);

    set({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
    });
  },

  /* =========================
     LOGOUT
  ========================= */
  logout: () => {
    removeToken();
    setAuthToken(null);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  /* =========================
     INIT (AUTO LOGIN REAL)
  ========================= */
  initialize: async () => {
    const token = getToken();

    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      setAuthToken(token);

      //  VALIDACIÓN REAL DEL TOKEN
      const user = await getMe();

      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      // token inválido o expirado
      removeToken();
      setAuthToken(null);

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },
}));