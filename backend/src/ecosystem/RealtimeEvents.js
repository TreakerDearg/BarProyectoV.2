/**
 * REALTIME EVENTS
 * Sistema de eventos en tiempo real para el ecosistema Bartender
 */

import { getIO } from '../socket/index.js';

/**
 * Espacios de nombres (namespaces) de Socket.IO
 */
export const SocketNamespace = Object.freeze({
  USER: 'user',
  PRESENCE: 'presence',
  NOTIFICATIONS: 'notifications',
  WORKSPACE: 'workspace',
  ADMIN: 'admin',
});

/**
 * Tipos de eventos del ecosistema
 */
export const EcosystemEventType = Object.freeze({
  // Sesión
  SESSION_LOGIN: 'session:login',
  SESSION_LOGOUT: 'session:logout',
  SESSION_REFRESH: 'session:refresh',
  SESSION_REVOKED: 'session:revoked',
  SESSION_EXPIRED: 'session:expired',
  
  // Identidad
  IDENTITY_PERMISSIONS_CHANGED: 'identity:permissions_changed',
  IDENTITY_ROLE_CHANGED: 'identity:role_changed',
  IDENTITY_LOCKED: 'identity:locked',
  IDENTITY_UNLOCKED: 'identity:unlocked',
  IDENTITY_VERIFIED: 'identity:verified',
  
  // Turno
  SHIFT_STARTED: 'shift:started',
  SHIFT_ENDED: 'shift:ended',
  SHIFT_BREAK_STARTED: 'shift:break_started',
  SHIFT_BREAK_ENDED: 'shift:break_ended',
  
  // Presencia
  PRESENCE_CHANGED: 'presence:changed',
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
  
  // Dispositivos
  DEVICE_ADDED: 'device:added',
  DEVICE_REMOVED: 'device:removed',
  DEVICE_REVOKED: 'device:revoked',
  
  // Notificaciones
  NOTIFICATION_SESSION_EXPIRED: 'notification:session_expired',
  NOTIFICATION_NEW_DEVICE: 'notification:new_device',
  NOTIFICATION_PASSWORD_CHANGED: 'notification:password_changed',
  NOTIFICATION_PERMISSIONS_CHANGED: 'notification:permissions_changed',
  NOTIFICATION_SHIFT_STARTED: 'notification:shift_started',
  NOTIFICATION_SHIFT_ENDED: 'notification:shift_ended',
  
  // Workspace
  WORKSPACE_UPDATED: 'workspace:updated',
  WORKSPACE_RELOADED: 'workspace:reloaded',
  
  // Admin
  ADMIN_USER_CREATED: 'admin:user_created',
  ADMIN_USER_UPDATED: 'admin:user_updated',
  ADMIN_USER_DELETED: 'admin:user_deleted',
  ADMIN_ROLE_CHANGED: 'admin:role_changed',
});

/**
 * Emite un evento a un usuario específico
 * @param {string} userId - ID del usuario
 * @param {string} eventType - Tipo de evento
 * @param {Object} data - Datos del evento
 */
export const emitToUser = (userId, eventType, data = {}) => {
  try {
    const io = getIO();
    if (!io) {
      console.warn('[RealtimeEvents] Socket.IO no disponible');
      return;
    }

    io.to(`user:${userId}`).emit(eventType, {
      userId,
      timestamp: new Date().toISOString(),
      ...data,
    });

    console.log(`[RealtimeEvents] Evento ${eventType} emitido a usuario ${userId}`);
  } catch (error) {
    console.error('[RealtimeEvents] Error al emitir a usuario:', error);
  }
};

/**
 * Emite un evento a todos los usuarios en un namespace
 * @param {string} namespace - Namespace
 * @param {string} eventType - Tipo de evento
 * @param {Object} data - Datos del evento
 */
export const emitToNamespace = (namespace, eventType, data = {}) => {
  try {
    const io = getIO();
    if (!io) {
      console.warn('[RealtimeEvents] Socket.IO no disponible');
      return;
    }

    io.of(namespace).emit(eventType, {
      timestamp: new Date().toISOString(),
      ...data,
    });

    console.log(`[RealtimeEvents] Evento ${eventType} emitido a namespace ${namespace}`);
  } catch (error) {
    console.error('[RealtimeEvents] Error al emitir a namespace:', error);
  }
};

/**
 * Emite un evento a todos los administradores
 * @param {string} eventType - Tipo de evento
 * @param {Object} data - Datos del evento
 */
export const emitToAdmins = (eventType, data = {}) => {
  try {
    const io = getIO();
    if (!io) {
      console.warn('[RealtimeEvents] Socket.IO no disponible');
      return;
    }

    io.of(SocketNamespace.ADMIN).emit(eventType, {
      timestamp: new Date().toISOString(),
      ...data,
    });

    console.log(`[RealtimeEvents] Evento ${eventType} emitido a administradores`);
  } catch (error) {
    console.error('[RealtimeEvents] Error al emitir a administradores:', error);
  }
};

/**
 * Emite un evento a todos los usuarios online
 * @param {string} eventType - Tipo de evento
 * @param {Object} data - Datos del evento
 */
export const emitToOnline = (eventType, data = {}) => {
  try {
    const io = getIO();
    if (!io) {
      console.warn('[RealtimeEvents] Socket.IO no disponible');
      return;
    }

    io.of(SocketNamespace.PRESENCE).emit(eventType, {
      timestamp: new Date().toISOString(),
      ...data,
    });

    console.log(`[RealtimeEvents] Evento ${eventType} emitido a usuarios online`);
  } catch (error) {
    console.error('[RealtimeEvents] Error al emitir a online:', error);
  }
};

/**
 * Emite un evento de notificación a un usuario
 * @param {string} userId - ID del usuario
 * @param {string} notificationType - Tipo de notificación
 * @param {Object} notificationData - Datos de la notificación
 */
export const emitNotification = (userId, notificationType, notificationData = {}) => {
  try {
    const io = getIO();
    if (!io) {
      console.warn('[RealtimeEvents] Socket.IO no disponible');
      return;
    }

    io.to(`user:${userId}`).emit('notification', {
      type: notificationType,
      timestamp: new Date().toISOString(),
      ...notificationData,
    });

    console.log(`[RealtimeEvents] Notificación ${notificationType} emitida a usuario ${userId}`);
  } catch (error) {
    console.error('[RealtimeEvents] Error al emitir notificación:', error);
  }
};

/**
 * Emite un evento de cambio de permisos
 * @param {string} userId - ID del usuario
 * @param {Array<string>} newPermissions - Nuevos permisos
 */
export const emitPermissionsChanged = (userId, newPermissions) => {
  emitToUser(userId, EcosystemEventType.IDENTITY_PERMISSIONS_CHANGED, {
    newPermissions,
  });
  
  emitNotification(userId, EcosystemEventType.NOTIFICATION_PERMISSIONS_CHANGED, {
    message: 'Tus permisos han sido actualizados',
    newPermissions,
  });
};

/**
 * Emite un evento de cambio de rol
 * @param {string} userId - ID del usuario
 * @param {string} newRole - Nuevo rol
 * @param {Array<string>} newPermissions - Nuevos permisos
 */
export const emitRoleChanged = (userId, newRole, newPermissions) => {
  emitToUser(userId, EcosystemEventType.IDENTITY_ROLE_CHANGED, {
    newRole,
    newPermissions,
  });
  
  emitNotification(userId, EcosystemEventType.ADMIN_ROLE_CHANGED, {
    message: 'Tu rol ha sido actualizado',
    newRole,
  });
};

/**
 * Emite un evento de inicio de turno
 * @param {string} userId - ID del usuario
 * @param {Object} shiftInfo - Información del turno
 */
export const emitShiftStarted = (userId, shiftInfo) => {
  emitToUser(userId, EcosystemEventType.SHIFT_STARTED, {
    shiftInfo,
  });
  
  emitNotification(userId, EcosystemEventType.NOTIFICATION_SHIFT_STARTED, {
    message: 'Tu turno ha comenzado',
    shiftInfo,
  });
};

/**
 * Emite un evento de fin de turno
 * @param {string} userId - ID del usuario
 * @param {Object} shiftInfo - Información del turno
 */
export const emitShiftEnded = (userId, shiftInfo) => {
  emitToUser(userId, EcosystemEventType.SHIFT_ENDED, {
    shiftInfo,
  });
  
  emitNotification(userId, EcosystemEventType.NOTIFICATION_SHIFT_ENDED, {
    message: 'Tu turno ha finalizado',
    shiftInfo,
  });
};

/**
 * Emite un evento de dispositivo nuevo
 * @param {string} userId - ID del usuario
 * @param {Object} deviceInfo - Información del dispositivo
 */
export const emitNewDevice = (userId, deviceInfo) => {
  emitToUser(userId, EcosystemEventType.DEVICE_ADDED, {
    deviceInfo,
  });
  
  emitNotification(userId, EcosystemEventType.NOTIFICATION_NEW_DEVICE, {
    message: 'Se ha iniciado sesión desde un nuevo dispositivo',
    deviceInfo,
  });
};

/**
 * Emite un evento de sesión expirada
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión
 */
export const emitSessionExpired = (userId, sessionId) => {
  emitToUser(userId, EcosystemEventType.SESSION_EXPIRED, {
    sessionId,
  });
  
  emitNotification(userId, EcosystemEventType.NOTIFICATION_SESSION_EXPIRED, {
    message: 'Tu sesión ha expirado',
    sessionId,
  });
};

/**
 * Emite un evento de actualización de workspace
 * @param {string} userId - ID del usuario
 * @param {Object} workspaceData - Datos del workspace
 */
export const emitWorkspaceUpdated = (userId, workspaceData) => {
  emitToUser(userId, EcosystemEventType.WORKSPACE_UPDATED, {
    workspaceData,
  });
};

/**
 * Emite un evento para recargar el workspace
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón de la recarga
 */
export const emitWorkspaceReload = (userId, reason = 'update') => {
  emitToUser(userId, EcosystemEventType.WORKSPACE_RELOADED, {
    reason,
  });
};

/**
 * Emite un evento de usuario bloqueado
 * @param {string} userId - ID del usuario
 * @param {Object} lockInfo - Información del bloqueo
 */
export const emitUserLocked = (userId, lockInfo) => {
  emitToUser(userId, EcosystemEventType.IDENTITY_LOCKED, {
    lockInfo,
  });
  
  emitNotification(userId, 'notification:user_locked', {
    message: 'Tu cuenta ha sido bloqueada temporalmente',
    lockInfo,
  });
};

/**
 * Emite un evento de usuario desbloqueado
 * @param {string} userId - ID del usuario
 */
export const emitUserUnlocked = (userId) => {
  emitToUser(userId, EcosystemEventType.IDENTITY_UNLOCKED, {});
  
  emitNotification(userId, 'notification:user_unlocked', {
    message: 'Tu cuenta ha sido desbloqueada',
  });
};

/**
 * Emite un evento de contraseña cambiada
 * @param {string} userId - ID del usuario
 */
export const emitPasswordChanged = (userId) => {
  emitToUser(userId, 'identity:password_changed', {});
  
  emitNotification(userId, EcosystemEventType.NOTIFICATION_PASSWORD_CHANGED, {
    message: 'Tu contraseña ha sido cambiada',
  });
};

/**
 * Registra un usuario en su namespace personal
 * @param {string} userId - ID del usuario
 * @param {string} socketId - ID del socket
 */
export const registerUserNamespace = (userId, socketId) => {
  try {
    const io = getIO();
    if (!io) return;

    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(`user:${userId}`);
      console.log(`[RealtimeEvents] Usuario ${userId} registrado en namespace personal`);
    }
  } catch (error) {
    console.error('[RealtimeEvents] Error al registrar usuario en namespace:', error);
  }
};

/**
 * Desregistra un usuario de su namespace personal
 * @param {string} userId - ID del usuario
 * @param {string} socketId - ID del socket
 */
export const unregisterUserNamespace = (userId, socketId) => {
  try {
    const io = getIO();
    if (!io) return;

    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(`user:${userId}`);
      console.log(`[RealtimeEvents] Usuario ${userId} desregistrado de namespace personal`);
    }
  } catch (error) {
    console.error('[RealtimeEvents] Error al desregistrar usuario de namespace:', error);
  }
};

/**
 * Obtiene el número de conexiones activas de un usuario
 * @param {string} userId - ID del usuario
 * @returns {number} Número de conexiones
 */
export const getUserConnectionCount = (userId) => {
  try {
    const io = getIO();
    if (!io) return 0;

    const room = io.sockets.adapter.rooms.get(`user:${userId}`);
    return room ? room.size : 0;
  } catch (error) {
    console.error('[RealtimeEvents] Error al obtener conexiones de usuario:', error);
    return 0;
  }
};
