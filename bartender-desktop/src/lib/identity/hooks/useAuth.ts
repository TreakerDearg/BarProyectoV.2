/* =========================================================
   USE AUTH HOOK
   Hook personalizado para autenticación
   Preparado para futura implementación
========================================================= */

import { useState, useCallback } from 'react';
import { identityService } from '../services';
import type { IdentityResponse, IdentityUser } from '../types';

interface UseAuthState {
  user: IdentityUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface UseAuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook personalizado para autenticación
 */
export const useAuth = (): UseAuthState & UseAuthActions => {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await identityService.authenticate(email, password);

      if (response.success && response.user && response.token) {
        // Guardar token en localStorage
        localStorage.setItem('bartender_token', response.token);

        setState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: response.message || 'Error de autenticación',
        });
      }
    } catch (error: any) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: error.message || 'Error de autenticación',
      });
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await identityService.register({ name, email, password });

      if (response.success && response.user && response.token) {
        // Guardar token en localStorage
        localStorage.setItem('bartender_token', response.token);

        setState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: response.message || 'Error de registro',
        });
      }
    } catch (error: any) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: error.message || 'Error de registro',
      });
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      await identityService.logout();
    } catch (error) {
      // Logout nunca debe romper UI
    } finally {
      // Limpiar token de localStorage
      localStorage.removeItem('bartender_token');

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await identityService.getProfile();

      if (response.success && response.user) {
        setState(prev => ({
          ...prev,
          user: response.user,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'Error al obtener perfil',
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al obtener perfil',
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshProfile,
    clearError,
  };
};
