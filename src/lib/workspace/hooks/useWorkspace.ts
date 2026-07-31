/**
 * USE WORKSPACE HOOK
 * Hook personalizado para gestionar el Workspace dinámico
 */

import { useState, useCallback, useEffect } from 'react';
import workspaceService from '../services/workspaceService';
import type { WorkspaceDefinition } from '../types/WorkspaceDefinition';
import { getAccessToken } from '@/lib/auth/tokenStorage';

interface UseWorkspaceState {
  workspace: WorkspaceDefinition | null;
  loading: boolean;
  error: string | null;
}

interface UseWorkspaceActions {
  fetchWorkspace: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook personalizado para gestionar el Workspace
 */
export const useWorkspace = (platform: string = 'web'): UseWorkspaceState & UseWorkspaceActions => {
  const [state, setState] = useState<UseWorkspaceState>({
    workspace: null,
    loading: true,
    error: null,
  });

  const fetchWorkspace = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const workspace = await workspaceService.getWorkspace(token, platform);

      setState({
        workspace,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        workspace: null,
        loading: false,
        error: error.message || 'Error al cargar workspace',
      });
    }
  }, [platform]);

  const refreshWorkspace = useCallback(async () => {
    await fetchWorkspace();
  }, [fetchWorkspace]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cargar workspace al montar
  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  return {
    ...state,
    fetchWorkspace,
    refreshWorkspace,
    clearError,
  };
};

/**
 * Hook para obtener solo la navegación
 */
export const useWorkspaceNavigation = (platform: string = 'web') => {
  const [navigation, setNavigation] = useState<any>(null);
  const [shortcuts, setShortcuts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNavigation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const data = await workspaceService.getWorkspaceNavigation(token, platform);
      setNavigation(data.navigation);
      setShortcuts(data.shortcuts);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Error al cargar navegación');
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => {
    fetchNavigation();
  }, [fetchNavigation]);

  return { navigation, shortcuts, loading, error, refresh: fetchNavigation };
};

/**
 * Hook para obtener solo los widgets
 */
export const useWorkspaceWidgets = (platform: string = 'web') => {
  const [widgets, setWidgets] = useState<any>(null);
  const [landingPage, setLandingPage] = useState<string>('/');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWidgets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const data = await workspaceService.getWorkspaceWidgets(token, platform);
      setWidgets(data.widgets);
      setLandingPage(data.landingPage || '/');
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Error al cargar widgets');
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  return { widgets, landingPage, loading, error, refresh: fetchWidgets };
};

/**
 * Hook para obtener solo las funcionalidades
 */
export const useWorkspaceFeatures = (platform: string = 'web') => {
  const [features, setFeatures] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const data = await workspaceService.getWorkspaceFeatures(token, platform);
      setFeatures(data.features);
      setPermissions(data.permissions || []);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Error al cargar funcionalidades');
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return { features, permissions, loading, error, refresh: fetchFeatures };
};
