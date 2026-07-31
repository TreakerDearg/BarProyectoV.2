/**
 * ECOSYSTEM SERVICE
 * Servicio principal que coordina todos los componentes del ecosistema Bartender
 */

import { ecosystemLogin, ecosystemLogout, ecosystemRefresh, ecosystemPermissionsChanged, ecosystemRoleChanged, ecosystemShiftStarted, ecosystemShiftEnded, ecosystemUserLocked, ecosystemUserUnlocked, getEcosystemState } from './IdentityBridge.js';
import { syncGlobalLogout, invalidateByRefreshToken, getActiveSessions } from './SessionSynchronizer.js';
import { updateActivity, setOffline, getOnlineUsers, getPresenceStats } from './PresenceService.js';
import { registerUserNamespace, unregisterUserNamespace, getUserConnectionCount } from './RealtimeEvents.js';
import { PlatformType, detectPlatformFromUserAgent } from './PlatformRegistry.js';
import Device from './DeviceManager.js';

/**
 * Inicializa una sesión en el ecosistema
 * @param {Object} user - Usuario
 * @param {Object} session - Información de sesión
 * @param {Object} requestInfo - Información de la solicitud
 * @returns {Object} Resultado de la inicialización
 */
export const initializeSession = async (user, session, requestInfo) => {
  try {
    const result = await ecosystemLogin(user, session, requestInfo);
    
    if (!result.success) {
      return result;
    }
    
    // Registrar usuario en namespace de Socket.IO
    if (requestInfo.socketId) {
      registerUserNamespace(user._id.toString(), requestInfo.socketId);
    }
    
    return result;
  } catch (error) {
    console.error('[EcosystemService] Error en initializeSession:', error);
    throw error;
  }
};

/**
 * Finaliza una sesión en el ecosistema
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión
 * @param {string} socketId - ID del socket (opcional)
 * @param {string} reason - Razón del cierre
 */
export const terminateSession = async (userId, sessionId, socketId = null, reason = 'user_logout') => {
  try {
    // Desregistrar usuario de namespace de Socket.IO
    if (socketId) {
      unregisterUserNamespace(userId, socketId);
    }
    
    await ecosystemLogout(userId, sessionId, reason);
  } catch (error) {
    console.error('[EcosystemService] Error en terminateSession:', error);
    throw error;
  }
};

/**
 * Refresca una sesión en el ecosistema
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión
 * @param {Date} newExpiresAt - Nueva fecha de expiración
 */
export const refreshSession = async (userId, sessionId, newExpiresAt) => {
  try {
    await ecosystemRefresh(userId, sessionId, newExpiresAt);
  } catch (error) {
    console.error('[EcosystemService] Error en refreshSession:', error);
    throw error;
  }
};

/**
 * Obtiene el estado completo del ecosistema para un usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Estado del ecosistema
 */
export const getUserEcosystemState = async (userId) => {
  try {
    return await getEcosystemState(userId);
  } catch (error) {
    console.error('[EcosystemService] Error en getUserEcosystemState:', error);
    throw error;
  }
};

/**
 * Obtiene todas las sesiones activas de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Array} Sesiones activas
 */
export const getUserSessions = async (userId) => {
  try {
    return await getActiveSessions(userId);
  } catch (error) {
    console.error('[EcosystemService] Error en getUserSessions:', error);
    throw error;
  }
};

/**
 * Cierra una sesión específica
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión a cerrar
 * @param {string} reason - Razón del cierre
 */
export const closeSession = async (userId, sessionId, reason = 'user_action') => {
  try {
    await Device.revokeDevice(sessionId, reason);
    
    // Emitir evento de cierre de sesión
    const { emitToUser } = await import('./RealtimeEvents.js');
    emitToUser(userId, 'session:revoked', {
      sessionId,
      reason,
    });
  } catch (error) {
    console.error('[EcosystemService] Error en closeSession:', error);
    throw error;
  }
};

/**
 * Cierra todas las sesiones excepto la actual
 * @param {string} userId - ID del usuario
 * @param {string} currentSessionId - ID de sesión actual
 * @param {string} reason - Razón del cierre
 */
export const closeAllOtherSessions = async (userId, currentSessionId, reason = 'global_logout') => {
  try {
    await syncGlobalLogout(userId, currentSessionId, reason);
  } catch (error) {
    console.error('[EcosystemService] Error en closeAllOtherSessions:', error);
    throw error;
  }
};

/**
 * Cierra todas las sesiones de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón del cierre
 */
export const closeAllSessions = async (userId, reason = 'global_logout') => {
  try {
    await syncGlobalLogout(userId, null, reason);
  } catch (error) {
    console.error('[EcosystemService] Error en closeAllSessions:', error);
    throw error;
  }
};

/**
 * Invalida un refresh token
 * @param {string} refreshTokenId - ID del refresh token
 * @param {string} reason - Razón de la invalidación
 */
export const invalidateRefreshToken = async (refreshTokenId, reason = 'token_revoked') => {
  try {
    await invalidateByRefreshToken(refreshTokenId, reason);
  } catch (error) {
    console.error('[EcosystemService] Error en invalidateRefreshToken:', error);
    throw error;
  }
};

/**
 * Notifica un cambio de permisos
 * @param {string} userId - ID del usuario
 * @param {Array<string>} newPermissions - Nuevos permisos
 */
export const notifyPermissionsChange = async (userId, newPermissions) => {
  try {
    await ecosystemPermissionsChanged(userId, newPermissions);
  } catch (error) {
    console.error('[EcosystemService] Error en notifyPermissionsChange:', error);
    throw error;
  }
};

/**
 * Notifica un cambio de rol
 * @param {string} userId - ID del usuario
 * @param {string} newRole - Nuevo rol
 * @param {Array<string>} newPermissions - Nuevos permisos
 */
export const notifyRoleChange = async (userId, newRole, newPermissions) => {
  try {
    await ecosystemRoleChanged(userId, newRole, newPermissions);
  } catch (error) {
    console.error('[EcosystemService] Error en notifyRoleChange:', error);
    throw error;
  }
};

/**
 * Notifica el inicio de turno
 * @param {string} userId - ID del usuario
 * @param {Object} shiftInfo - Información del turno
 */
export const notifyShiftStart = async (userId, shiftInfo) => {
  try {
    await ecosystemShiftStarted(userId, shiftInfo);
  } catch (error) {
    console.error('[EcosystemService] Error en notifyShiftStart:', error);
    throw error;
  }
};

/**
 * Notifica el fin de turno
 * @param {string} userId - ID del usuario
 * @param {Object} shiftInfo - Información del turno
 */
export const notifyShiftEnd = async (userId, shiftInfo) => {
  try {
    await ecosystemShiftEnded(userId, shiftInfo);
  } catch (error) {
    console.error('[EcosystemService] Error en notifyShiftEnd:', error);
    throw error;
  }
};

/**
 * Bloquea un usuario en el ecosistema
 * @param {string} userId - ID del usuario
 * @param {Object} lockInfo - Información del bloqueo
 */
export const lockUser = async (userId, lockInfo) => {
  try {
    await ecosystemUserLocked(userId, lockInfo);
  } catch (error) {
    console.error('[EcosystemService] Error en lockUser:', error);
    throw error;
  }
};

/**
 * Desbloquea un usuario en el ecosistema
 * @param {string} userId - ID del usuario
 */
export const unlockUser = async (userId) => {
  try {
    await ecosystemUserUnlocked(userId);
  } catch (error) {
    console.error('[EcosystemService] Error en unlockUser:', error);
    throw error;
  }
};

/**
 * Actualiza la actividad de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} platform - Plataforma
 */
export const updateUserActivity = (userId, platform) => {
  try {
    updateActivity(userId, platform);
  } catch (error) {
    console.error('[EcosystemService] Error en updateUserActivity:', error);
  }
};

/**
 * Obtiene todos los usuarios online
 * @returns {Array} Usuarios online
 */
export const getOnlineUsersList = () => {
  try {
    return getOnlineUsers();
  } catch (error) {
    console.error('[EcosystemService] Error en getOnlineUsersList:', error);
    return [];
  }
};

/**
 * Obtiene estadísticas del ecosistema
 * @returns {Object} Estadísticas
 */
export const getEcosystemStats = async () => {
  try {
    const presenceStats = getPresenceStats();
    const deviceStats = await Device.getDeviceStats();
    
    return {
      presence: presenceStats,
      devices: deviceStats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[EcosystemService] Error en getEcosystemStats:', error);
    throw error;
  }
};

/**
 * Obtiene el número de conexiones activas de un usuario
 * @param {string} userId - ID del usuario
 * @returns {number} Número de conexiones
 */
export const getUserActiveConnections = (userId) => {
  try {
    return getUserConnectionCount(userId);
  } catch (error) {
    console.error('[EcosystemService] Error en getUserActiveConnections:', error);
    return 0;
  }
};

/**
 * Verifica si un usuario tiene sesiones activas
 * @param {string} userId - ID del usuario
 * @returns {boolean}
 */
export const hasActiveUserSessions = async (userId) => {
  try {
    const sessions = await getActiveSessions(userId);
    return sessions.length > 0;
  } catch (error) {
    console.error('[EcosystemService] Error en hasActiveUserSessions:', error);
    return false;
  }
};

/**
 * Limpia sesiones expiradas (mantenimiento)
 * @returns {number} Número de sesiones limpiadas
 */
export const cleanupExpiredSessions = async () => {
  try {
    const count = await Device.cleanupExpiredDevices();
    console.log(`[EcosystemService] Limpiadas ${count} sesiones expiradas`);
    return count;
  } catch (error) {
    console.error('[EcosystemService] Error en cleanupExpiredSessions:', error);
    return 0;
  }
};

/**
 * Verifica si una sesión es válida
 * @param {string} sessionId - ID de sesión
 * @returns {boolean}
 */
export const isSessionValid = async (sessionId) => {
  try {
    return await Device.isDeviceValid(sessionId);
  } catch (error) {
    console.error('[EcosystemService] Error en isSessionValid:', error);
    return false;
  }
};

/**
 * Obtiene información de un dispositivo por sessionId
 * @param {string} sessionId - ID de sesión
 * @returns {Object} Información del dispositivo
 */
export const getDeviceInfo = async (sessionId) => {
  try {
    const device = await Device.findOne({ sessionId });
    return device;
  } catch (error) {
    console.error('[EcosystemService] Error en getDeviceInfo:', error);
    return null;
  }
};

/**
 * Obtiene todos los dispositivos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Array} Dispositivos
 */
export const getUserDevices = async (userId) => {
  try {
    return await Device.getAllDevices(userId);
  } catch (error) {
    console.error('[EcosystemService] Error en getUserDevices:', error);
    return [];
  }
};

/**
 * Obtiene estadísticas de dispositivos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Array} Estadísticas
 */
export const getUserDeviceStats = async (userId) => {
  try {
    return await Device.getDeviceStats(userId);
  } catch (error) {
    console.error('[EcosystemService] Error en getUserDeviceStats:', error);
    return [];
  }
};

// Exportar todas las funciones
const ecosystemService = {
  initializeSession,
  terminateSession,
  refreshSession,
  getUserEcosystemState,
  getUserSessions,
  closeSession,
  closeAllOtherSessions,
  closeAllSessions,
  invalidateRefreshToken,
  notifyPermissionsChange,
  notifyRoleChange,
  notifyShiftStart,
  notifyShiftEnd,
  lockUser,
  unlockUser,
  updateUserActivity,
  getOnlineUsersList,
  getEcosystemStats,
  getUserActiveConnections,
  hasActiveUserSessions,
  cleanupExpiredSessions,
  isSessionValid,
  getDeviceInfo,
  getUserDevices,
  getUserDeviceStats,
};

export default ecosystemService;
