/* =========================================================
   IDENTITY RESPONSE CONTRACT
   Contrato único para todas las respuestas de autenticación
   Compartido entre frontend y backend
========================================================= */

import { IdentityStatus } from './IdentityStatus';
import { IdentityRole } from './IdentityRole';

/**
 * Usuario normalizado en respuesta de identidad
 */
export interface IdentityUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  shift: string | null;
  isEmployee: boolean;
  isActive: boolean;
  lastLogin: Date | null;
}

/**
 * Metadatos de respuesta de identidad
 */
export interface IdentityMetadata {
  session?: {
    platform?: string;
    device?: string;
    ip?: string;
  };
  code?: string;
}

/**
 * Respuesta de identidad estandarizada
 */
export interface IdentityResponse {
  success: boolean;
  user: IdentityUser | null;
  role: string | null;
  roleLabel: string | null;
  status: IdentityStatus | null;
  permissions: Record<string, boolean>;
  destination: string | null;
  token: string | null;
  refreshToken: string | null;
  metadata: IdentityMetadata;
  message: string | null;
}

/**
 * Códigos de error de identidad
 */
export enum IdentityErrorCodes {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  USER_LOCKED = 'USER_LOCKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_NOT_ALLOWED = 'ROLE_NOT_ALLOWED',
  SHIFT_NOT_ALLOWED = 'SHIFT_NOT_ALLOWED',
  OFF_SHIFT = 'OFF_SHIFT',
  MFA_REQUIRED = 'MFA_REQUIRED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
}

/**
 * Verifica si una respuesta de identidad es exitosa
 */
export const isIdentitySuccess = (response: IdentityResponse): boolean => {
  return response.success === true;
};

/**
 * Verifica si una respuesta de identidad es un error específico
 */
export const isIdentityError = (response: IdentityResponse, code: IdentityErrorCodes): boolean => {
  return !response.success && response.metadata.code === code;
};

/**
 * Obtiene el mensaje de error de una respuesta de identidad
 */
export const getIdentityErrorMessage = (response: IdentityResponse): string => {
  return response.message || 'Error desconocido';
};
