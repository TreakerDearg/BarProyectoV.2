/* =========================================================
   USE AUTH HOOK
   Hook personalizado para autenticación con refresh tokens
========================================================= */

import { useState, useCallback, useEffect } from 'react';
import { identityService } from '../services';
import type { IdentityResponse, IdentityUser } from '../types';
import { saveAccessToken, saveRefreshToken, clearTokens } from '../../auth/tokenStorage';

interface UseAuthState {
  user: IdentityUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  destination: string | null;
  identityStatus: string | null;
  canAccess: boolean | null;
  blockMessage: any | null;
  desktopAccessMessage: any | null;
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
    refreshToken: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    destination: null,
    identityStatus: null,
    canAccess: null,
    blockMessage: null,
    desktopAccessMessage: null,
  });

  // Escuchar evento de logout global
  useEffect(() => {
    const handleLogout = () => {
      setState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        destination: null,
        identityStatus: null,
        canAccess: null,
        blockMessage: null,
        desktopAccessMessage: null,
      });
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await identityService.authenticate(email, password);

      if (response.success && response.user && response.token && response.refreshToken) {
        // Guardar tokens en localStorage
        saveAccessToken(response.token);
        saveRefreshToken(response.refreshToken);

        setState({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          loading: false,
          error: null,
          destination: response.destination || null,
          identityStatus: response.identityStatus || null,
          canAccess: response.canAccess ?? true,
          blockMessage: response.blockMessage || null,
          desktopAccessMessage: response.desktopAccessMessage || null,
        });
      } else {
        setState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: response.message || 'Error de autenticación',
          destination: null,
          identityStatus: null,
          canAccess: null,
          blockMessage: null,
          desktopAccessMessage: null,
        });
      }
    } catch (error: any) {
      setState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: error.message || 'Error de autenticación',
        destination: null,
        identityStatus: null,
        canAccess: null,
        blockMessage: null,
        desktopAccessMessage: null,
      });
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await identityService.register({ name, email, password });

      if (response.success && response.user && response.token && response.refreshToken) {
        // Guardar tokens en localStorage
        saveAccessToken(response.token);
        saveRefreshToken(response.refreshToken);

        setState({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          loading: false,
          error: null,
          destination: response.destination || null,
          identityStatus: response.identityStatus || null,
          canAccess: response.canAccess ?? true,
          blockMessage: response.blockMessage || null,
          desktopAccessMessage: response.desktopAccessMessage || null,
        });
      } else {
        setState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: response.message || 'Error de registro',
          destination: null,
          identityStatus: null,
          canAccess: null,
          blockMessage: null,
          desktopAccessMessage: null,
        });
      }
    } catch (error: any) {
      setState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: error.message || 'Error de registro',
        destination: null,
        identityStatus: null,
        canAccess: null,
        blockMessage: null,
        desktopAccessMessage: null,
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
      // Limpiar tokens de localStorage
      clearTokens();

      setState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        destination: null,
        identityStatus: null,
        canAccess: null,
        blockMessage: null,
        desktopAccessMessage: null,
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
