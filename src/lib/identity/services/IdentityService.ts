/* =========================================================
   IDENTITY SERVICE (FRONTEND)
   Servicio central de identidad para el frontend
   Preparado para futura implementación
========================================================= */

import api from '../api/client';
import type { IdentityResponse, IdentityUser } from '../types';

/**
 * Servicio de identidad para el frontend
 */
class IdentityService {
  /**
   * Autentica un usuario con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña
   * @returns Respuesta de identidad
   */
  async authenticate(email: string, password: string): Promise<IdentityResponse> {
    try {
      const response = await api.post<IdentityResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        user: null,
        role: null,
        roleLabel: null,
        status: null,
        permissions: {},
        destination: null,
        token: null,
        refreshToken: null,
        metadata: { code: error.code || 'AUTH_ERROR' },
        message: error.message || 'Error de autenticación',
      };
    }
  }

  /**
   * Registra un nuevo usuario (solo clientes por ahora)
   * @param userData - Datos del usuario
   * @returns Respuesta de identidad
   */
  async register(userData: { name: string; email: string; password: string }): Promise<IdentityResponse> {
    try {
      const response = await api.post<IdentityResponse>('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        user: null,
        role: null,
        roleLabel: null,
        status: null,
        permissions: {},
        destination: null,
        token: null,
        refreshToken: null,
        metadata: { code: error.code || 'REGISTER_ERROR' },
        message: error.message || 'Error de registro',
      };
    }
  }

  /**
   * Obtiene el perfil de un usuario autenticado
   * @returns Respuesta de identidad
   */
  async getProfile(): Promise<IdentityResponse> {
    try {
      const response = await api.get<IdentityResponse>('/auth/me');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        user: null,
        role: null,
        roleLabel: null,
        status: null,
        permissions: {},
        destination: null,
        token: null,
        refreshToken: null,
        metadata: { code: error.code || 'PROFILE_ERROR' },
        message: error.message || 'Error al obtener perfil',
      };
    }
  }

  /**
   * Cierra la sesión del usuario
   * @returns Respuesta de identidad
   */
  async logout(): Promise<IdentityResponse> {
    try {
      const response = await api.post<IdentityResponse>('/auth/logout');
      return response.data;
    } catch (error: any) {
      // Logout nunca debe romper UI
      return {
        success: true,
        user: null,
        role: null,
        roleLabel: null,
        status: null,
        permissions: {},
        destination: null,
        token: null,
        refreshToken: null,
        metadata: {},
        message: 'Logout OK',
      };
    }
  }

  /**
   * Refresca el token de acceso (preparado para futura implementación)
   * @param refreshToken - Refresh token
   * @returns Respuesta de identidad
   */
  async refreshToken(refreshToken: string): Promise<IdentityResponse> {
    // TODO: Implementar cuando se agregue refresh tokens en backend
    throw new Error('Refresh tokens no implementados aún');
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   * @param user - Usuario
   * @param permission - Permiso a verificar
   * @returns Tiene permiso o no
   */
  hasPermission(user: IdentityUser | null, permission: string): boolean {
    if (!user || !user.permissions) return false;
    return user.permissions[permission] === true;
  }

  /**
   * Verifica si un usuario tiene todos los permisos especificados
   * @param user - Usuario
   * @param permissions - Permisos a verificar
   * @returns Tiene todos los permisos o no
   */
  hasAllPermissions(user: IdentityUser | null, permissions: string[]): boolean {
    return permissions.every(perm => this.hasPermission(user, perm));
  }

  /**
   * Verifica si un usuario tiene al menos uno de los permisos especificados
   * @param user - Usuario
   * @param permissions - Permisos a verificar
   * @returns Tiene al menos un permiso o no
   */
  hasAnyPermission(user: IdentityUser | null, permissions: string[]): boolean {
    return permissions.some(perm => this.hasPermission(user, perm));
  }
}

export default new IdentityService();
