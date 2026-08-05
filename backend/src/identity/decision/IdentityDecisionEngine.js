/**
 * IDENTITY DECISION ENGINE
 * Motor central de decisión para Bartender Identity
 * Coordina todos los resolvers para determinar el destino del usuario
 */

import { determineIdentityStatus, IdentityStatus } from '../types/IdentityStatus.js';
import { resolveRole } from './RoleResolver.js';
import { resolvePermissions } from './PermissionResolver.js';
import { resolveDestination, getBlockMessage } from './DestinationResolver.js';
import { resolveShift, getDesktopAccessMessage } from './ShiftResolver.js';
import ActivityLog from '../../models/ActivityLog.js';

/**
 * Ejecuta el motor de decisión de identidad
 * @param {Object} user - Usuario del modelo User
 * @param {Object} context - Contexto adicional (opcional)
 * @returns {Object} Respuesta completa de identidad
 */
export const executeIdentityDecision = async (user, context = {}) => {
  // 1. Resolver rol
  const roleInfo = resolveRole(user);
  
  // 2. Resolver turno (si es empleado)
  const shiftInfo = resolveShift(user);
  
  // 3. Determinar estado de identidad
  const identityStatus = determineIdentityStatus(user, shiftInfo);
  
  // 4. Resolver permisos
  const permissionInfo = resolvePermissions(user);
  
  // 5. Resolver destino
  const destinationInfo = resolveDestination(identityStatus, shiftInfo, user.role);
  
  // 6. Obtener mensaje de bloqueo si aplica
  let blockMessage = null;
  if (!destinationInfo.canAccess) {
    blockMessage = getBlockMessage(identityStatus, user);
  }
  
  // 7. Obtener mensaje de acceso a Desktop si es empleado
  let desktopAccessMessage = null;
  if (roleInfo.isEmployee && !destinationInfo.canAccess) {
    desktopAccessMessage = getDesktopAccessMessage(user);
  }
  
  const decision = {
    // Información básica
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    
    // Rol
    role: roleInfo.role,
    roleLabel: roleInfo.label,
    isEmployee: roleInfo.isEmployee,
    isAdmin: roleInfo.isAdmin,
    
    // Estado de identidad
    identityStatus,
    identityStatusLabel: getIdentityStatusLabel(identityStatus),
    
    // Permisos
    permissions: permissionInfo.permissions,
    hasCustomPermissions: permissionInfo.hasCustomPermissions,
    
    // Turno
    shift: shiftInfo,
    
    // Destino
    destination: destinationInfo.destination,
    destinationReason: destinationInfo.reason,
    canAccess: destinationInfo.canAccess,
    requiresAction: destinationInfo.requiresAction,
    
    // Mensajes
    blockMessage,
    desktopAccessMessage,
    
    // Metadata
    provider: user.provider || 'local',
    providerVerified: user.providerVerified || false,
    lastLogin: user.lastLogin,
    
    // Contexto
    context,
  };
  
  // Registrar decisión en ActivityLog (async, no bloquear)
  ActivityLog.logIdentityDecision(decision).catch(err => {
    console.error('Error al registrar decisión de identidad:', err);
  });
  
  return decision;
};

/**
 * Obtiene el label legible del estado de identidad
 * @param {string} status - Estado de identidad
 * @returns {string} Label del estado
 */
const getIdentityStatusLabel = (status) => {
  const labels = {
    [IdentityStatus.CLIENT]: 'Cliente',
    [IdentityStatus.EMPLOYEE]: 'Empleado',
    [IdentityStatus.EMPLOYEE_WORKING]: 'Empleado en turno',
    [IdentityStatus.EMPLOYEE_OFF_SHIFT]: 'Empleado fuera de turno',
    [IdentityStatus.EMPLOYEE_BREAK]: 'Empleado en descanso',
    [IdentityStatus.ADMIN]: 'Administrador',
    [IdentityStatus.OWNER]: 'Dueño',
    [IdentityStatus.LOCKED]: 'Cuenta bloqueada',
    [IdentityStatus.INACTIVE]: 'Cuenta inactiva',
    [IdentityStatus.PENDING_VERIFICATION]: 'Verificación pendiente',
  };
  return labels[status] || 'Desconocido';
};

/**
 * Verifica si el usuario puede hacer login
 * @param {Object} user - Usuario del modelo User
 * @returns {Object} Resultado de verificación
 */
export const canLogin = (user) => {
  const identityStatus = determineIdentityStatus(user);
  
  const activeStatuses = [
    IdentityStatus.CLIENT,
    IdentityStatus.EMPLOYEE,
    IdentityStatus.EMPLOYEE_WORKING,
    IdentityStatus.EMPLOYEE_OFF_SHIFT,
    IdentityStatus.EMPLOYEE_BREAK,
    IdentityStatus.ADMIN,
    IdentityStatus.OWNER,
  ];
  
  const canLoginUser = activeStatuses.includes(identityStatus);
  
  if (!canLoginUser) {
    return {
      canLogin: false,
      reason: getIdentityStatusLabel(identityStatus),
      blockMessage: getBlockMessage(identityStatus, user),
    };
  }
  
  return {
    canLogin: true,
  };
};

/**
 * Ejecuta el motor de decisión para login
 * @param {Object} user - Usuario del modelo User
 * @param {Object} sessionInfo - Información de sesión
 * @param {Object} tokens - Tokens generados
 * @returns {Object} Respuesta completa de login con decisión
 */
export const executeLoginDecision = async (user, sessionInfo = {}, tokens = {}) => {
  const decision = await executeIdentityDecision(user, {
    loginTime: new Date(),
    userAgent: sessionInfo.userAgent,
    ipAddress: sessionInfo.ipAddress,
  });
  
  return {
    success: true,
    ...decision,
    session: sessionInfo,
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpiresIn: tokens.expiresIn,
  };
};

/**
 * Ejecuta el motor de decisión para refresh token
 * @param {Object} user - Usuario del modelo User
 * @param {Object} sessionInfo - Información de sesión
 * @returns {Object} Respuesta de refresh con decisión actualizada
 */
export const executeRefreshDecision = async (user, sessionInfo = {}) => {
  const decision = await executeIdentityDecision(user, {
    refreshTime: new Date(),
    userAgent: sessionInfo.userAgent,
    ipAddress: sessionInfo.ipAddress,
  });
  
  return {
    success: true,
    ...decision,
    session: sessionInfo,
  };
};
