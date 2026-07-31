/**
 * SESSION SYNCHRONIZER
 * Sincroniza sesiones entre todas las aplicaciones del ecosistema
 */

import Device from './DeviceManager.js';
import { getIO } from '../socket/index.js';

/**
 * Tipos de eventos de sesión
 */
export const SessionEventType = Object.freeze({
  LOGIN: 'session:login',
  LOGOUT: 'session:logout',
  REFRESH: 'session:refresh',
  REVOKED: 'session:revoked',
  EXPIRED: 'session:expired',
  PERMISSIONS_CHANGED: 'session:permissions_changed',
  ROLE_CHANGED: 'session:role_changed',
  DEVICE_ADDED: 'session:device_added',
  DEVICE_REMOVED: 'session:device_removed',
});

/**
 * Emite un evento de sesión a todas las aplicaciones del usuario
 * @param {string} userId - ID del usuario
 * @param {string} eventType - Tipo de evento
 * @param {Object} data - Datos del evento
 */
export const emitSessionEvent = (userId, eventType, data = {}) => {
  try {
    const io = getIO();
    if (!io) {
      console.warn('[SessionSynchronizer] Socket.IO no disponible');
      return;
    }

    // Emitir al namespace del usuario
    io.to(`user:${userId}`).emit(eventType, {
      userId,
      timestamp: new Date().toISOString(),
      ...data,
    });

    console.log(`[SessionSynchronizer] Evento ${eventType} emitido para usuario ${userId}`);
  } catch (error) {
    console.error('[SessionSynchronizer] Error al emitir evento:', error);
  }
};

/**
 * Sincroniza un login a todas las aplicaciones
 * @param {Object} user - Usuario
 * @param {Object} session - Información de sesión
 * @param {Object} device - Información del dispositivo
 */
export const syncLogin = async (user, session, device) => {
  try {
    // Registrar dispositivo
    const deviceRecord = await Device.registerDevice({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      sessionId: session.sessionId,
      refreshTokenId: session.refreshTokenId,
      tokenExpiresAt: session.tokenExpiresAt,
      refreshTokenExpiresAt: session.refreshTokenExpiresAt,
      platform: device.platform,
      deviceType: device.deviceType,
      browser: device.browser,
      os: device.os,
      appVersion: device.appVersion,
      deviceName: device.deviceName,
      ipAddress: device.ipAddress,
      userAgent: device.userAgent,
      location: device.location,
    });

    // Emitir evento de login
    emitSessionEvent(user._id.toString(), SessionEventType.LOGIN, {
      sessionId: session.sessionId,
      platform: device.platform,
      deviceName: device.deviceName,
      ipAddress: device.ipAddress,
    });

    return deviceRecord;
  } catch (error) {
    console.error('[SessionSynchronizer] Error en syncLogin:', error);
    throw error;
  }
};

/**
 * Sincroniza un logout a todas las aplicaciones
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión
 * @param {string} reason - Razón del logout
 */
export const syncLogout = async (userId, sessionId, reason = 'user_logout') => {
  try {
    // Revocar dispositivo
    await Device.revokeDevice(sessionId, reason);

    // Emitir evento de logout
    emitSessionEvent(userId, SessionEventType.LOGOUT, {
      sessionId,
      reason,
    });

    console.log(`[SessionSynchronizer] Logout sincronizado para sesión ${sessionId}`);
  } catch (error) {
    console.error('[SessionSynchronizer] Error en syncLogout:', error);
    throw error;
  }
};

/**
 * Sincroniza un refresh de token
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión
 * @param {Date} newExpiresAt - Nueva fecha de expiración
 */
export const syncRefresh = async (userId, sessionId, newExpiresAt) => {
  try {
    // Actualizar actividad y expiración
    await Device.updateActivity(sessionId);
    
    // Emitir evento de refresh
    emitSessionEvent(userId, SessionEventType.REFRESH, {
      sessionId,
      newExpiresAt,
    });

    console.log(`[SessionSynchronizer] Refresh sincronizado para sesión ${sessionId}`);
  } catch (error) {
    console.error('[SessionSynchronizer] Error en syncRefresh:', error);
    throw error;
  }
};

/**
 * Sincroniza una revocación de sesión
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión
 * @param {string} reason - Razón de la revocación
 */
export const syncRevoked = async (userId, sessionId, reason = 'session_revoked') => {
  try {
    // Revocar dispositivo
    await Device.revokeDevice(sessionId, reason);

    // Emitir evento de revocación
    emitSessionEvent(userId, SessionEventType.REVOKED, {
      sessionId,
      reason,
    });

    console.log(`[SessionSynchronizer] Revocación sincronizada para sesión ${sessionId}`);
  } catch (error) {
    console.error('[SessionSynchronizer] Error en syncRevoked:', error);
    throw error;
  }
};

/**
 * Sincroniza un cambio de permisos
 * @param {string} userId - ID del usuario
 * @param {Array<string>} newPermissions - Nuevos permisos
 */
export const syncPermissionsChanged = async (userId, newPermissions) => {
  try {
    // Emitir evento de cambio de permisos
    emitSessionEvent(userId, SessionEventType.PERMISSIONS_CHANGED, {
      newPermissions,
    });

    console.log(`[SessionSynchronizer] Cambio de permisos sincronizado para usuario ${userId}`);
  } catch (error) {
    console.error('[SessionSynchronizer] Error en syncPermissionsChanged:', error);
    throw error;
  }
};

/**
 * Sincroniza un cambio de rol
 * @param {string} userId - ID del usuario
 * @param {string} newRole - Nuevo rol
 * @param {Array<string>} newPermissions - Nuevos permisos
 */
export const syncRoleChanged = async (userId, newRole, newPermissions) => {
  try {
    // Actualizar rol en todos los dispositivos activos
    await Device.updateMany(
      { userId, isActive: true, isRevoked: false },
      { userRole: newRole }
    );

    // Emitir evento de cambio de rol
    emitSessionEvent(userId, SessionEventType.ROLE_CHANGED, {
      newRole,
      newPermissions,
    });

    console.log(`[SessionSynchronizer] Cambio de rol sincronizado para usuario ${userId}`);
  } catch (error) {
    console.error('[SessionSynchronizer] Error en syncRoleChanged:', error);
    throw error;
  }
};

/**
 * Realiza un logout global (cerrar todas las sesiones)
 * @param {string} userId - ID del usuario
 * @param {string} currentSessionId - ID de sesión actual (para no cerrar esta)
 * @param {string} reason - Razón del logout
 */
export const syncGlobalLogout = async (userId, currentSessionId = null, reason = 'global_logout') => {
  try {
    if (currentSessionId) {
      // Revocar todas excepto la actual
      await Device.revokeAllDevicesExcept(userId, currentSessionId, reason);
      
      // Emitir evento a todos excepto la sesión actual
      emitSessionEvent(userId, SessionEventType.LOGOUT, {
        exceptSessionId: currentSessionId,
        reason,
      });
    } else {
      // Revocar todas las sesiones
      await Device.revokeAllDevices(userId, reason);
      
      // Emitir evento a todos
      emitSessionEvent(userId, SessionEventType.LOGOUT, {
        reason,
      });
    }

    console.log(`[SessionSynchronizer] Logout global sincronizado para usuario ${userId}`);
  } catch (error) {
    console.error('[SessionSynchronizer] Error en syncGlobalLogout:', error);
    throw error;
  }
};

/**
 * Invalida una sesión por refreshToken
 * @param {string} refreshTokenId - ID del refresh token
 * @param {string} reason - Razón de la invalidación
 */
export const invalidateByRefreshToken = async (refreshTokenId, reason = 'token_revoked') => {
  try {
    const device = await Device.revokeByRefreshToken(refreshTokenId, reason);
    
    if (device) {
      // Emitir evento de revocación
      emitSessionEvent(device.userId.toString(), SessionEventType.REVOKED, {
        sessionId: device.sessionId,
        reason,
      });

      console.log(`[SessionSynchronizer] Invalidación por refresh token sincronizada`);
    }
  } catch (error) {
    console.error('[SessionSynchronizer] Error en invalidateByRefreshToken:', error);
    throw error;
  }
};

/**
 * Obtiene todas las sesiones activas de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Array} Sesiones activas
 */
export const getActiveSessions = async (userId) => {
  try {
    const devices = await Device.getActiveDevices(userId);
    return devices.map(device => ({
      sessionId: device.sessionId,
      platform: device.platform,
      deviceName: device.deviceName,
      browser: device.browser,
      os: device.os,
      ipAddress: device.ipAddress,
      lastActivity: device.lastActivity,
      createdAt: device.createdAt,
    }));
  } catch (error) {
    console.error('[SessionSynchronizer] Error en getActiveSessions:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario tiene sesiones activas
 * @param {string} userId - ID del usuario
 * @returns {boolean}
 */
export const hasActiveSessions = async (userId) => {
  try {
    const count = await Device.countDocuments({
      userId,
      isActive: true,
      isRevoked: false,
    });
    return count > 0;
  } catch (error) {
    console.error('[SessionSynchronizer] Error en hasActiveSessions:', error);
    return false;
  }
};
