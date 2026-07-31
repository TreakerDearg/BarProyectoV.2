/**
 * WORKSPACE SERVICE
 * Servicio para interactuar con el Workspace Builder
 */

import axios from 'axios';
import type { WorkspaceDefinition, WorkspaceResponse } from '../types/WorkspaceDefinition';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Obtiene el Workspace completo
 */
export const getWorkspace = async (token: string, platform: string = 'web'): Promise<WorkspaceDefinition> => {
  const response = await axios.get<WorkspaceResponse>(`${API_URL}/workspace`, {
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
  const response = await axios.get(`${API_URL}/workspace/navigation`, {
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
  const response = await axios.get(`${API_URL}/workspace/widgets`, {
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
  const response = await axios.get(`${API_URL}/workspace/features`, {
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
