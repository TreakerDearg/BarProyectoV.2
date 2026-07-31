/**
 * IDENTITY BRIDGE
 * Conecta Bartender Identity con el ecosistema
 * Integra Identity Decision Engine con Session Synchronizer y Realtime Events
 */

import { executeIdentityDecision } from '../identity/decision/IdentityDecisionEngine.js';
import { syncLogin, syncLogout, syncRefresh, syncPermissionsChanged, syncRoleChanged } from './SessionSynchronizer.js';
import { updateActivity, setWorkStatus, setOffline } from './PresenceService.js';
import { emitPermissionsChanged, emitRoleChanged, emitShiftStarted, emitShiftEnded, emitUserLocked, emitUserUnlocked } from './RealtimeEvents.js';
import { PlatformType, detectPlatformFromUserAgent } from './PlatformRegistry.js';

/**
 * Ejecuta el login en el ecosistema
 * @param {Object} user - Usuario
 * @param {Object} session - Información de sesión
 * @param {Object} requestInfo - Información de la solicitud
 * @returns {Object} Resultado del login
 */
export const ecosystemLogin = async (user, session, requestInfo) => {
  try {
    // 1. Detectar plataforma
    const platform = requestInfo.platform || detectPlatformFromUserAgent(requestInfo.userAgent);
    
    // 2. Ejecutar Identity Decision Engine
    const identityResponse = await executeIdentityDecision(user, {
      platform,
      userAgent: requestInfo.userAgent,
      ipAddress: requestInfo.ipAddress,
    });
    
    // 3. Verificar si el usuario puede hacer login
    if (!identityResponse.canAccess) {
      return {
        success: false,
        reason: identityResponse.blockMessage?.message || 'No puedes acceder en este momento',
        identityResponse,
      };
    }
    
    // 4. Sincronizar login con Session Synchronizer
    const device = await syncLogin(user, session, {
      platform,
      deviceType: requestInfo.deviceType,
      browser: requestInfo.browser,
      os: requestInfo.os,
      appVersion: requestInfo.appVersion,
      deviceName: requestInfo.deviceName,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      location: requestInfo.location,
    });
    
    // 5. Actualizar presencia
    updateActivity(user._id.toString(), platform);
    
    // 6. Si el usuario está en turno, actualizar estado de trabajo
    if (identityResponse.identityStatus === 'EMPLOYEE_WORKING') {
      setWorkStatus(user._id.toString(), 'working', identityResponse.shift);
    } else if (identityResponse.identityStatus === 'EMPLOYEE_BREAK') {
      setWorkStatus(user._id.toString(), 'break', identityResponse.shift);
    }
    
    return {
      success: true,
      identityResponse,
      device,
    };
  } catch (error) {
    console.error('[IdentityBridge] Error en ecosystemLogin:', error);
    throw error;
  }
};

/**
 * Ejecuta el logout en el ecosistema
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión
 * @param {string} reason - Razón del logout
 */
export const ecosystemLogout = async (userId, sessionId, reason = 'user_logout') => {
  try {
    // 1. Sincronizar logout con Session Synchronizer
    await syncLogout(userId, sessionId, reason);
    
    // 2. Actualizar presencia a offline
    setOffline(userId);
    
    console.log(`[IdentityBridge] Logout ejecutado para usuario ${userId}`);
  } catch (error) {
    console.error('[IdentityBridge] Error en ecosystemLogout:', error);
    throw error;
  }
};

/**
 * Ejecuta un refresh de token en el ecosistema
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión
 * @param {Date} newExpiresAt - Nueva fecha de expiración
 */
export const ecosystemRefresh = async (userId, sessionId, newExpiresAt) => {
  try {
    // 1. Sincronizar refresh con Session Synchronizer
    await syncRefresh(userId, sessionId, newExpiresAt);
    
    // 2. Actualizar actividad
    updateActivity(userId, 'unknown');
    
    console.log(`[IdentityBridge] Refresh ejecutado para sesión ${sessionId}`);
  } catch (error) {
    console.error('[IdentityBridge] Error en ecosystemRefresh:', error);
    throw error;
  }
};

/**
 * Notifica un cambio de permisos en el ecosistema
 * @param {string} userId - ID del usuario
 * @param {Array<string>} newPermissions - Nuevos permisos
 */
export const ecosystemPermissionsChanged = async (userId, newPermissions) => {
  try {
    // 1. Sincronizar con Session Synchronizer
    await syncPermissionsChanged(userId, newPermissions);
    
    // 2. Emitir evento de cambio de permisos
    emitPermissionsChanged(userId, newPermissions);
    
    // 3. Emitir evento para recargar workspace
    const { emitWorkspaceReload } = await import('./RealtimeEvents.js');
    emitWorkspaceReload(userId, 'permissions_changed');
    
    console.log(`[IdentityBridge] Cambio de permisos notificado para usuario ${userId}`);
  } catch (error) {
    console.error('[IdentityBridge] Error en ecosystemPermissionsChanged:', error);
    throw error;
  }
};

/**
 * Notifica un cambio de rol en el ecosistema
 * @param {string} userId - ID del usuario
 * @param {string} newRole - Nuevo rol
 * @param {Array<string>} newPermissions - Nuevos permisos
 */
export const ecosystemRoleChanged = async (userId, newRole, newPermissions) => {
  try {
    // 1. Sincronizar con Session Synchronizer
    await syncRoleChanged(userId, newRole, newPermissions);
    
    // 2. Emitir evento de cambio de rol
    emitRoleChanged(userId, newRole, newPermissions);
    
    // 3. Emitir evento para recargar workspace
    const { emitWorkspaceReload } = await import('./RealtimeEvents.js');
    emitWorkspaceReload(userId, 'role_changed');
    
    console.log(`[IdentityBridge] Cambio de rol notificado para usuario ${userId}`);
  } catch (error) {
    console.error('[IdentityBridge] Error en ecosystemRoleChanged:', error);
    throw error;
  }
};

/**
 * Notifica el inicio de turno en el ecosistema
 * @param {string} userId - ID del usuario
 * @param {Object} shiftInfo - Información del turno
 */
export const ecosystemShiftStarted = async (userId, shiftInfo) => {
  try {
    // 1. Actualizar estado de presencia
    setWorkStatus(userId, 'working', shiftInfo);
    
    // 2. Emitir evento de inicio de turno
    emitShiftStarted(userId, shiftInfo);
    
    // 3. Emitir evento para recargar workspace
    const { emitWorkspaceReload } = await import('./RealtimeEvents.js');
    emitWorkspaceReload(userId, 'shift_started');
    
    console.log(`[IdentityBridge] Inicio de turno notificado para usuario ${userId}`);
  } catch (error) {
    console.error('[IdentityBridge] Error en ecosystemShiftStarted:', error);
    throw error;
  }
};

/**
 * Notifica el fin de turno en el ecosistema
 * @param {string} userId - ID del usuario
 * @param {Object} shiftInfo - Información del turno
 */
export const ecosystemShiftEnded = async (userId, shiftInfo) => {
  try {
    // 1. Actualizar estado de presencia
    setWorkStatus(userId, 'offline', shiftInfo);
    
    // 2. Emitir evento de fin de turno
    emitShiftEnded(userId, shiftInfo);
    
    // 3. Emitir evento para recargar workspace
    const { emitWorkspaceReload } = await import('./RealtimeEvents.js');
    emitWorkspaceReload(userId, 'shift_ended');
    
    console.log(`[IdentityBridge] Fin de turno notificado para usuario ${userId}`);
  } catch (error) {
    console.error('[IdentityBridge] Error en ecosystemShiftEnded:', error);
    throw error;
  }
};

/**
 * Notifica que un usuario ha sido bloqueado
 * @param {string} userId - ID del usuario
 * @param {Object} lockInfo - Información del bloqueo
 */
export const ecosystemUserLocked = async (userId, lockInfo) => {
  try {
    // 1. Emitir evento de usuario bloqueado
    emitUserLocked(userId, lockInfo);
    
    // 2. Revocar todas las sesiones del usuario
    const { syncGlobalLogout } = await import('./SessionSynchronizer.js');
    await syncGlobalLogout(userId, null, 'user_locked');
    
    console.log(`[IdentityBridge] Usuario bloqueado notificado para ${userId}`);
  } catch (error) {
    console.error('[IdentityBridge] Error en ecosystemUserLocked:', error);
    throw error;
  }
};

/**
 * Notifica que un usuario ha sido desbloqueado
 * @param {string} userId - ID del usuario
 */
export const ecosystemUserUnlocked = async (userId) => {
  try {
    // 1. Emitir evento de usuario desbloqueado
    emitUserUnlocked(userId);
    
    console.log(`[IdentityBridge] Usuario desbloqueado notificado para ${userId}`);
  } catch (error) {
    console.error('[IdentityBridge] Error en ecosystemUserUnlocked:', error);
    throw error;
  }
};

/**
 * Obtiene el estado completo del ecosistema para un usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Estado del ecosistema
 */
export const getEcosystemState = async (userId) => {
  try {
    const { getActiveSessions } = await import('./SessionSynchronizer.js');
    const { getPresence } = await import('./PresenceService.js');
    const { getUserConnectionCount } = await import('./RealtimeEvents.js');
    
    const [sessions, presence, connectionCount] = await Promise.all([
      getActiveSessions(userId),
      Promise.resolve(getPresence(userId)),
      Promise.resolve(getUserConnectionCount(userId)),
    ]);
    
    return {
      userId,
      sessions,
      presence,
      activeConnections: connectionCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[IdentityBridge] Error en getEcosystemState:', error);
    throw error;
  }
};
