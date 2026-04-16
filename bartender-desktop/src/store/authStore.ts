import { create } from "zustand";
import { login as loginService } from "../modules/auth/services/authService";
import type { User } from "../types/auth";
import { saveToken, removeToken, getToken } from "../utils/tokenStorage";
import { setAuthToken } from "../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

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

  logout: () => {
    removeToken();
    setAuthToken(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  initialize: () => {
    const token = getToken();
    if (token) {
      setAuthToken(token);
      set({ token, isAuthenticated: true });
    }
  },
}));