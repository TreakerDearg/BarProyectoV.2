/**
 * WORKSPACE SERVICE
 * Servicio para interactuar con el Workspace Builder
 */

import axios from 'axios';
import { resolveApiBaseUrl } from '@/lib/api/network';
import type { WorkspaceDefinition, WorkspaceResponse } from '../types/WorkspaceDefinition';

function apiUrl(path: string): string {
  return `${resolveApiBaseUrl()}${path}`;
}

/**
 * Obtiene el Workspace completo
 */
export const getWorkspace = async (token: string, platform: string = 'web'): Promise<WorkspaceDefinition> => {
  const response = await axios.get<WorkspaceResponse>(apiUrl('/workspace'), {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Platform': platform,
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener workspace');
  }

  return response.data.data;
};

/**
 * Obtiene solo la navegación del Workspace
 */
export const getWorkspaceNavigation = async (token: string, platform: string = 'web') => {
  const response = await axios.get(apiUrl('/workspace/navigation'), {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Platform': platform,
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener navegación');
  }

  return response.data.data;
};

/**
 * Obtiene solo los widgets del Workspace
 */
export const getWorkspaceWidgets = async (token: string, platform: string = 'web') => {
  const response = await axios.get(apiUrl('/workspace/widgets'), {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Platform': platform,
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener widgets');
  }

  return response.data.data;
};

/**
 * Obtiene solo las funcionalidades del Workspace
 */
export const getWorkspaceFeatures = async (token: string, platform: string = 'web') => {
  const response = await axios.get(apiUrl('/workspace/features'), {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Platform': platform,
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener funcionalidades');
  }

  return response.data.data;
};

const workspaceService = {
  getWorkspace,
  getWorkspaceNavigation,
  getWorkspaceWidgets,
  getWorkspaceFeatures,
};

export default workspaceService;
