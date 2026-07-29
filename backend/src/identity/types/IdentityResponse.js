/* =========================================================
   IDENTITY RESPONSE CONTRACT
   Contrato único para todas las respuestas de autenticación
========================================================= */

import { determineIdentityStatus } from './IdentityStatus.js';
import { getRoleLabel } from './IdentityRole.js';

/**
 * Crea una respuesta de identidad estandarizada
 * @param {Object} options - Opciones de respuesta
 * @returns {Object} Respuesta de identidad
 */
export const createIdentityResponse = (options = {}) => {
  const user = options.user || null;
  const token = options.token || null;
  const refreshToken = options.refreshToken || null;

  // Determinar estado de identidad
  const status = user ? determineIdentityStatus(user) : null;

  // Determinar destino de redirección según rol
  const destination = determineDestination(user, status);

  return {
    // Éxito
    success: options.success !== false,

    // Usuario
    user: user ? normalizeUser(user) : null,

    // Rol
    role: user?.role || null,
    roleLabel: user?.role ? getRoleLabel(user.role) : null,

    // Estado
    status: status,

    // Permisos
    permissions: user?.permissions || {},

    // Destino de redirección
    destination: destination,

    // Tokens
    token: token,
    refreshToken: refreshToken,

    // Metadatos
    metadata: options.metadata || {},

    // Mensaje
    message: options.message || null,
  };
};

/**
 * Normaliza el usuario para la respuesta
 * @param {Object} user - Usuario del modelo User
 * @returns {Object} Usuario normalizado
 */
const normalizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    shift: user.shift,
    isEmployee: user.isEmployee,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
  };
};

/**
 * Determina el destino de redirección según rol y estado
 * @param {Object} user - Usuario
 * @param {string} status - Estado de identidad
 * @returns {string} URL de destino
 */
const determineDestination = (user, status) => {
  if (!user || !user.role) return null;

  // Clientes van a la web
  if (user.role === 'client') {
    return '/cliente';
  }

  // Administración va al admin
  if (user.role === 'admin' || user.role === 'owner' || user.role === 'manager') {
    return '/admin';
  }

  // Empleados van al desktop
  if (user.isEmployee) {
    // Si está trabajando, va al desktop directamente
    if (status === 'EMPLOYEE_WORKING') {
      return '/desktop';
    }

    // Si está fuera de turno, podría mostrar mensaje
    if (status === 'EMPLOYEE_OFF_SHIFT') {
      return '/desktop?status=off-shift';
    }

    // Por defecto, desktop
    return '/desktop';
  }

  return null;
};

/**
 * Crea una respuesta de error de identidad
 * @param {string} message - Mensaje de error
 * @param {string} code - Código de error
 * @returns {Object} Respuesta de error
 */
export const createIdentityError = (message, code = 'IDENTITY_ERROR') => {
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
    metadata: { code },
    message: message,
  };
};

/**
 * Códigos de error de identidad
 */
export const IdentityErrorCodes = Object.freeze({
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_INACTIVE: 'USER_INACTIVE',
  USER_LOCKED: 'USER_LOCKED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ROLE_NOT_ALLOWED: 'ROLE_NOT_ALLOWED',
  SHIFT_NOT_ALLOWED: 'SHIFT_NOT_ALLOWED',
  OFF_SHIFT: 'OFF_SHIFT',
  MFA_REQUIRED: 'MFA_REQUIRED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
});
