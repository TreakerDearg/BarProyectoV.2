/* =========================================================
   IDENTITY USER STRUCTURE
   Representación unificada de usuario desacoplada del modelo
========================================================= */

import { determineIdentityStatus } from './IdentityStatus.js';
import { getRoleLabel, isEmployeeRole } from './IdentityRole.js';

/**
 * Crea una estructura de usuario de identidad
 * @param {Object} userModel - Usuario del modelo User
 * @returns {Object} Usuario de identidad
 */
export const createIdentityUser = (userModel) => {
  if (!userModel) return null;

  return {
    // Identificación básica
    id: userModel._id?.toString(),
    name: userModel.name,
    email: userModel.email,

    // Rol y estado
    role: userModel.role,
    roleLabel: getRoleLabel(userModel.role),
    status: determineIdentityStatus(userModel),
    isEmployee: userModel.isEmployee || isEmployeeRole(userModel.role),

    // Turno (para empleados)
    shift: userModel.shift || null,

    // Estado de cuenta
    isActive: userModel.isActive,
    isLocked: userModel.lockUntil && userModel.lockUntil > Date.now(),
    lockedUntil: userModel.lockUntil || null,

    // Permisos
    permissions: userModel.permissions || {},

    // Seguridad
    lastLogin: userModel.lastLogin,
    loginAttempts: userModel.loginAttempts || 0,

    // Horario (para empleados)
    schedule: userModel.schedule || null,

    // Asistencia (para empleados)
    attendance: userModel.attendance || null,

    // Metadatos
    metadata: {
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt,
    },
  };
};

/**
 * Verifica si un usuario puede hacer login
 * @param {Object} identityUser - Usuario de identidad
 * @returns {boolean}
 */
export const canUserLogin = (identityUser) => {
  if (!identityUser) return false;
  if (!identityUser.isActive) return false;
  if (identityUser.isLocked) return false;
  return true;
};

/**
 * Obtiene el mensaje de bloqueo de un usuario
 * @param {Object} identityUser - Usuario de identidad
 * @returns {string|null} Mensaje de bloqueo
 */
export const getLockMessage = (identityUser) => {
  if (!identityUser || !identityUser.isLocked) return null;

  if (identityUser.lockedUntil) {
    const minutesLeft = Math.ceil((new Date(identityUser.lockedUntil) - new Date()) / 60000);
    return `Cuenta bloqueada. Intenta en ${minutesLeft} minuto(s)`;
  }

  return 'Cuenta bloqueada';
};

/**
 * Verifica si un usuario está en turno
 * @param {Object} identityUser - Usuario de identidad
 * @returns {boolean}
 */
export const isUserOnShift = (identityUser) => {
  if (!identityUser || !identityUser.isEmployee) return false;
  return identityUser.status === 'EMPLOYEE_WORKING';
};

/**
 * Verifica si un usuario está fuera de turno
 * @param {Object} identityUser - Usuario de identidad
 * @returns {boolean}
 */
export const isUserOffShift = (identityUser) => {
  if (!identityUser || !identityUser.isEmployee) return false;
  return identityUser.status === 'EMPLOYEE_OFF_SHIFT';
};

/**
 * Verifica si un usuario está en descanso
 * @param {Object} identityUser - Usuario de identidad
 * @returns {boolean}
 */
export const isUserOnBreak = (identityUser) => {
  if (!identityUser || !identityUser.isEmployee) return false;
  return identityUser.status === 'EMPLOYEE_BREAK';
};
