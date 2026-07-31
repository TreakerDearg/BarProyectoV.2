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
 * Información del turno del empleado
 */
export interface ShiftInfo {
  active: boolean;
  scheduled: boolean;
  withinSchedule: boolean;
  onBreak: boolean;
  isLate: boolean;
  startsAt: string | null;
  endsAt: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  minutesUntilStart: number | null;
  minutesUntilEnd: number | null;
  attendanceStatus: string;
  message: string;
}

/**
 * Mensaje de bloqueo
 */
export interface BlockMessage {
  title: string;
  message: string;
  unlockAt?: string;
  minutesLeft?: number;
  contactAdmin?: boolean;
  requiresVerification?: boolean;
}

/**
 * Mensaje de acceso a Desktop
 */
export interface DesktopAccessMessage {
  title: string;
  message: string;
  canAccess: boolean;
  shiftStart?: string;
  shiftEnd?: string;
  breakEnd?: string;
  minutesUntilStart?: number;
}

/**
 * Respuesta de identidad estandarizada con Decision Engine
 */
export interface IdentityResponse {
  success: boolean;
  user: IdentityUser | null;
  role: string | null;
  roleLabel: string | null;
  isEmployee: boolean | null;
  isAdmin: boolean | null;
  identityStatus: string | null;
  identityStatusLabel: string | null;
  permissions: string[] | null;
  hasCustomPermissions: boolean | null;
  shift: ShiftInfo | null;
  destination: string | null;
  destinationReason: string | null;
  canAccess: boolean | null;
  requiresAction: string | null;
  blockMessage: BlockMessage | null;
  desktopAccessMessage: DesktopAccessMessage | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiresIn?: number;
  session?: any;
  provider: string | null;
  providerVerified: boolean | null;
  lastLogin: Date | null;
  context?: any;
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
