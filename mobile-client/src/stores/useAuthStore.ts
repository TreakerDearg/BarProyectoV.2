// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Auth Store
// Gestiona sesión del usuario. Token persistido en SecureStore.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { AuthUserDTO } from '../types/api';
import { socketService } from '../socket/socketService';
import {
  loginUser,
  registerUser,
  logoutUser,
  humanizeAuthError,
  type LoginPayload,
  type RegisterPayload,
} from '../api/authApi';

interface AuthState {
  token:     string | null;
  user:      AuthUserDTO | null;
  isLoading: boolean;
  error:     string | null;

  // Primitivas de bajo nivel
  setAuth:     (token: string, user: AuthUserDTO) => Promise<void>;
  clearAuth:   () => Promise<void>;
  loadSession: () => Promise<void>;
  clearError:  () => void;

  // Actions de alto nivel (llaman a la API)
  login:    (payload: LoginPayload)    => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout:   () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token:     null,
  user:      null,
  isLoading: true,
  error:     null,

  // ── Primitivas ────────────────────────────────────────────────────────────

  setAuth: async (token, user) => {
    try {
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
      if (user.id) socketService.joinUser(user.id);
      set({ token, user, isLoading: false, error: null });
    } catch (e) {
      console.warn('[AuthStore] Error guardando sesión:', e);
    }
  },

  clearAuth: async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
    } catch {}
    set({ token: null, user: null, isLoading: false, error: null });
  },

  loadSession: async () => {
    try {
      const token    = await SecureStore.getItemAsync('auth_token');
      const userJson = await SecureStore.getItemAsync('auth_user');
      if (token && userJson) {
        const user = JSON.parse(userJson) as AuthUserDTO;
        if (user.id) socketService.joinUser(user.id);
        set({ token, user, isLoading: false });
        return;
      }
    } catch (e) {
      console.warn('[AuthStore] Error cargando sesión:', e);
    }
    set({ token: null, user: null, isLoading: false });
  },

  clearError: () => set({ error: null }),

  // ── Actions de alto nivel ──────────────────────────────────────────────────

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const result = await loginUser(payload);
      await get().setAuth(result.token, result.user);
    } catch (err: any) {
      const msg = humanizeAuthError(
        err?.response?.data?.message ?? err?.message,
        err?.response?.status,
      );
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const result = await registerUser(payload);
      await get().setAuth(result.token, result.user);
    } catch (err: any) {
      const msg = humanizeAuthError(
        err?.response?.data?.message ?? err?.message,
        err?.response?.status,
      );
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    const { token, user } = get();
    set({ isLoading: true });
    try {
      // Intentar invalidar token en el backend (no bloqueante)
      await logoutUser(token ?? undefined);
    } catch {}
    await get().clearAuth();
  },
}));
