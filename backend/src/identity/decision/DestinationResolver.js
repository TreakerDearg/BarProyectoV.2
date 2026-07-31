/**
 * DESTINATION RESOLVER
 * Determina el destino del usuario después del login
 * El backend es la única fuente de verdad para redirecciones
 */

import { IdentityStatus } from '../types/IdentityStatus.js';

/**
 * Destinos del sistema
 */
export const DESTINATIONS = {
  CLIENT: '/cliente',
  ADMIN: '/admin',
  DESKTOP: '/desktop',
  EMPLOYEE: '/employee',
  LOCKED: '/auth/locked',
  VERIFY: '/auth/verify',
};

/**
 * Resuelve el destino del usuario basado en su estado de identidad
 * @param {string} identityStatus - Estado de identidad
 * @param {Object} shiftInfo - Información del turno (opcional)
 * @param {string} role - Rol del usuario
 * @returns {Object} Destino y metadata
 */
export const resolveDestination = (identityStatus, shiftInfo = null, role = null) => {
  // Estados de cuenta bloqueados
  if (identityStatus === IdentityStatus.LOCKED) {
    return {
      destination: DESTINATIONS.LOCKED,
      reason: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos',
      canAccess: false,
      requiresAction: 'wait_for_unlock',
    };
  }

  if (identityStatus === IdentityStatus.INACTIVE) {
    return {
      destination: DESTINATIONS.LOCKED,
      reason: 'Cuenta inactiva. Contacta al administrador.',
      canAccess: false,
      requiresAction: 'contact_admin',
    };
  }

  if (identityStatus === IdentityStatus.PENDING_VERIFICATION) {
    return {
      destination: DESTINATIONS.VERIFY,
      reason: 'Cuenta pendiente de verificación',
      canAccess: false,
      requiresAction: 'verify_account',
    };
  }

  // Roles de administración
  if (identityStatus === IdentityStatus.ADMIN) {
    return {
      destination: DESTINATIONS.ADMIN,
      reason: 'Acceso al Dashboard Administrativo',
      canAccess: true,
      requiresAction: null,
    };
  }

  if (identityStatus === IdentityStatus.OWNER) {
    return {
      destination: DESTINATIONS.ADMIN,
      reason: 'Acceso al Dashboard Administrativo (Dueño)',
      canAccess: true,
      requiresAction: null,
    };
  }

  // Clientes
  if (identityStatus === IdentityStatus.CLIENT) {
    return {
      destination: DESTINATIONS.CLIENT,
      reason: 'Acceso al sistema del cliente',
      canAccess: true,
      requiresAction: null,
    };
  }

  // Empleados
  if (identityStatus === IdentityStatus.EMPLOYEE_WORKING) {
    return {
      destination: DESTINATIONS.DESKTOP,
      reason: 'Acceso al sistema Desktop (turno activo)',
      canAccess: true,
      requiresAction: null,
      shiftActive: true,
    };
  }

  if (identityStatus === IdentityStatus.EMPLOYEE_BREAK) {
    return {
      destination: DESTINATIONS.DESKTOP,
      reason: 'Acceso al sistema Desktop (en descanso)',
      canAccess: true,
      requiresAction: null,
      shiftActive: true,
      onBreak: true,
    };
  }

  if (identityStatus === IdentityStatus.EMPLOYEE_OFF_SHIFT) {
    // Empleado fuera de turno - mostrar pantalla informativa
    return {
      destination: DESTINATIONS.EMPLOYEE,
      reason: 'Empleado fuera de turno',
      canAccess: false,
      requiresAction: 'wait_for_shift',
      shiftActive: false,
      shiftInfo: shiftInfo || null,
    };
  }

  if (identityStatus === IdentityStatus.EMPLOYEE) {
    // Empleado genérico - verificar turno
    if (shiftInfo?.active) {
      return {
        destination: DESTINATIONS.DESKTOP,
        reason: 'Acceso al sistema Desktop',
        canAccess: true,
        requiresAction: null,
        shiftActive: true,
      };
    }
    
    return {
      destination: DESTINATIONS.EMPLOYEE,
      reason: 'Empleado sin turno activo',
      canAccess: false,
      requiresAction: 'start_shift',
      shiftActive: false,
      shiftInfo: shiftInfo || null,
    };
  }

  // Por defecto, enviar a cliente
  return {
    destination: DESTINATIONS.CLIENT,
    reason: 'Destino por defecto',
    canAccess: true,
    requiresAction: null,
  };
};

/**
 * Verifica si el usuario puede acceder al sistema Desktop
 * @param {string} identityStatus - Estado de identidad
 * @param {Object} shiftInfo - Información del turno
 * @returns {boolean}
 */
export const canAccessDesktop = (identityStatus, shiftInfo = null) => {
  const destination = resolveDestination(identityStatus, shiftInfo);
  return destination.destination === DESTINATIONS.DESKTOP && destination.canAccess;
};

/**
 * Verifica si el usuario puede acceder al sistema Admin
 * @param {string} identityStatus - Estado de identidad
 * @returns {boolean}
 */
export const canAccessAdmin = (identityStatus) => {
  const destination = resolveDestination(identityStatus);
  return destination.destination === DESTINATIONS.ADMIN && destination.canAccess;
};

/**
 * Verifica si el usuario puede acceder al sistema Cliente
 * @param {string} identityStatus - Estado de identidad
 * @returns {boolean}
 */
export const canAccessClient = (identityStatus) => {
  const destination = resolveDestination(identityStatus);
  return destination.destination === DESTINATIONS.CLIENT && destination.canAccess;
};

/**
 * Obtiene el mensaje de bloqueo para el usuario
 * @param {string} identityStatus - Estado de identidad
 * @param {Object} user - Usuario del modelo User
 * @returns {Object} Mensaje de bloqueo
 */
export const getBlockMessage = (identityStatus, user = null) => {
  if (identityStatus === IdentityStatus.LOCKED) {
    const lockUntil = user?.lockUntil;
    const unlockTime = lockUntil ? new Date(lockUntil) : null;
    const minutesLeft = unlockTime ? Math.ceil((unlockTime - new Date()) / 60000) : null;
    
    return {
      title: 'Cuenta bloqueada temporalmente',
      message: minutesLeft 
        ? `Tu cuenta está bloqueada por múltiples intentos fallidos. Podrás intentar nuevamente en ${minutesLeft} minutos.`
        : 'Tu cuenta está bloqueada temporalmente. Intenta más tarde.',
      unlockAt: unlockTime?.toISOString(),
      minutesLeft,
    };
  }

  if (identityStatus === IdentityStatus.INACTIVE) {
    return {
      title: 'Cuenta inactiva',
      message: 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.',
      contactAdmin: true,
    };
  }

  if (identityStatus === IdentityStatus.PENDING_VERIFICATION) {
    return {
      title: 'Verificación pendiente',
      message: 'Tu cuenta está pendiente de verificación. Por favor completa el proceso de verificación.',
      requiresVerification: true,
    };
  }

  return {
    title: 'Acceso no disponible',
    message: 'No puedes acceder al sistema en este momento.',
  };
};
