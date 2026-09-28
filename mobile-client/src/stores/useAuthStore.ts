import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { AuthUserDTO } from "../types/api";
import { socketService } from "../socket/socketService";

interface AuthState {
  token: string | null;
  user: AuthUserDTO | null;
  isLoading: boolean;

  setAuth: (token: string, user: AuthUserDTO) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setAuth: async (token, user) => {
    try {
      await SecureStore.setItemAsync("auth_token", token);
      await SecureStore.setItemAsync("auth_user", JSON.stringify(user));
      socketService.joinUser(user.id);
      set({ token, user, isLoading: false });
    } catch (e) {
      console.warn("[AuthStore] Error guardando sesión:", e);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("auth_user");
      set({ token: null, user: null, isLoading: false });
    } catch (e) {
      console.warn("[AuthStore] Error en logout:", e);
    }
  },

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      const userJson = await SecureStore.getItemAsync("auth_user");
      if (token && userJson) {
        const user = JSON.parse(userJson) as AuthUserDTO;
        socketService.joinUser(user.id);
        set({ token, user, isLoading: false });
        return;
      }
    } catch (e) {
      console.warn("[AuthStore] Error cargando sesión:", e);
    }
    set({ token: null, user: null, isLoading: false });
  },
}));
