/**
 * PRESENCE SERVICE
 * Gestiona el estado de presencia de los usuarios en tiempo real
 */

/**
 * Estados de presencia
 */
export const PresenceStatus = Object.freeze({
  ONLINE: 'online',
  OFFLINE: 'offline',
  WORKING: 'working',
  BREAK: 'break',
  AWAY: 'away',
  BUSY: 'busy',
  INACTIVE: 'inactive',
});

/**
 * Tiempos de inactividad para cambiar de estado (en milisegundos)
 */
const INACTIVITY_THRESHOLDS = {
  AWAY: 5 * 60 * 1000,      // 5 minutos
  INACTIVE: 15 * 60 * 1000,  // 15 minutos
  OFFLINE: 30 * 60 * 1000,    // 30 minutos
};

/**
 * Almacén en memoria de presencia (en producción usar Redis)
 */
const presenceStore = new Map();

/**
 * Actualiza el estado de presencia de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} status - Estado de presencia
 * @param {Object} metadata - Metadata adicional
 */
export const updatePresence = (userId, status, metadata = {}) => {
  const presence = {
    userId,
    status,
    lastActivity: new Date().toISOString(),
    metadata,
  };
  
  presenceStore.set(userId, presence);
  
  // Emitir evento de cambio de presencia
  emitPresenceChange(userId, status, metadata);
  
  return presence;
};

/**
 * Obtiene el estado de presencia de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Estado de presencia
 */
export const getPresence = (userId) => {
  return presenceStore.get(userId) || {
    userId,
    status: PresenceStatus.OFFLINE,
    lastActivity: null,
    metadata: {},
  };
};

/**
 * Actualiza la actividad de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} platform - Plataforma
 */
export const updateActivity = (userId, platform) => {
  const currentPresence = getPresence(userId);
  
  // Si estaba offline, cambiar a online
  if (currentPresence.status === PresenceStatus.OFFLINE) {
    return updatePresence(userId, PresenceStatus.ONLINE, { platform });
  }
  
  // Si estaba away o inactive, cambiar a online
  if (currentPresence.status === PresenceStatus.AWAY || currentPresence.status === PresenceStatus.INACTIVE) {
    return updatePresence(userId, PresenceStatus.ONLINE, { platform });
  }
  
  // Actualizar solo la última actividad
  currentPresence.lastActivity = new Date().toISOString();
  currentPresence.metadata.platform = platform;
  presenceStore.set(userId, currentPresence);
  
  return currentPresence;
};

/**
 * Establece el estado de trabajo de un empleado
 * @param {string} userId - ID del usuario
 * @param {string} status - Estado (working, break)
 * @param {Object} shiftInfo - Información del turno
 */
export const setWorkStatus = (userId, status, shiftInfo = {}) => {
  return updatePresence(userId, status, {
    ...shiftInfo,
    type: 'work',
  });
};

/**
 * Establece el estado away de un usuario
 * @param {string} userId - ID del usuario
 */
export const setAway = (userId) => {
  return updatePresence(userId, PresenceStatus.AWAY, {
    reason: 'inactivity',
  });
};

/**
 * Establece el estado busy de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón
 */
export const setBusy = (userId, reason = 'manual') => {
  return updatePresence(userId, PresenceStatus.BUSY, {
    reason,
  });
};

/**
 * Establece el estado offline de un usuario
 * @param {string} userId - ID del usuario
 */
export const setOffline = (userId) => {
  const presence = {
    userId,
    status: PresenceStatus.OFFLINE,
    lastActivity: new Date().toISOString(),
    metadata: {},
  };
  
  presenceStore.set(userId, presence);
  
  // Emitir evento de cambio de presencia
  emitPresenceChange(userId, PresenceStatus.OFFLINE, {});
  
  return presence;
};

/**
 * Obtiene todos los usuarios con un estado específico
 * @param {string} status - Estado de presencia
 * @returns {Array} Usuarios con ese estado
 */
export const getUsersByStatus = (status) => {
  const users = [];
  for (const [userId, presence] of presenceStore.entries()) {
    if (presence.status === status) {
      users.push(presence);
    }
  }
  return users;
};

/**
 * Obtiene todos los usuarios online
 * @returns {Array} Usuarios online
 */
export const getOnlineUsers = () => {
  const users = [];
  for (const [userId, presence] of presenceStore.entries()) {
    if (presence.status !== PresenceStatus.OFFLINE) {
      users.push(presence);
    }
  }
  return users;
};

/**
 * Obtiene estadísticas de presencia
 * @returns {Object} Estadísticas
 */
export const getPresenceStats = () => {
  const stats = {
    total: presenceStore.size,
    online: 0,
    working: 0,
    break: 0,
    away: 0,
    busy: 0,
    inactive: 0,
    offline: 0,
  };
  
  for (const [, presence] of presenceStore.entries()) {
    stats[presence.status] = (stats[presence.status] || 0) + 1;
  }
  
  return stats;
};

/**
 * Emite un evento de cambio de presencia
 * @param {string} userId - ID del usuario
 * @param {string} status - Estado de presencia
 * @param {Object} metadata - Metadata
 */
const emitPresenceChange = (userId, status, metadata) => {
  try {
    const io = getIO();
    if (!io) {
      console.warn('[PresenceService] Socket.IO no disponible');
      return;
    }

    // Emitir al namespace de presencia
    io.to('presence').emit('presence:changed', {
      userId,
      status,
      timestamp: new Date().toISOString(),
      metadata,
    });

    console.log(`[PresenceService] Presencia actualizada para usuario ${userId}: ${status}`);
  } catch (error) {
    console.error('[PresenceService] Error al emitir cambio de presencia:', error);
  }
};

/**
 * Verifica y actualiza usuarios inactivos
 * Debe ejecutarse periódicamente (ej. cada minuto)
 */
export const checkInactiveUsers = () => {
  const now = new Date();
  
  for (const [userId, presence] of presenceStore.entries()) {
    if (presence.status === PresenceStatus.OFFLINE) continue;
    
    const lastActivity = new Date(presence.lastActivity);
    const inactiveTime = now - lastActivity;
    
    // Cambiar a away después de 5 minutos
    if (inactiveTime > INACTIVITY_THRESHOLDS.AWAY && presence.status === PresenceStatus.ONLINE) {
      setAway(userId);
    }
    
    // Cambiar a inactive después de 15 minutos
    if (inactiveTime > INACTIVITY_THRESHOLDS.INACTIVE && presence.status !== PresenceStatus.INACTIVE) {
      updatePresence(userId, PresenceStatus.INACTIVE, {
        reason: 'long_inactivity',
      });
    }
    
    // Cambiar a offline después de 30 minutos
    if (inactiveTime > INACTIVITY_THRESHOLDS.OFFLINE) {
      setOffline(userId);
    }
  }
};

/**
 * Limpia usuarios offline antiguos
 * @param {number} maxAge - Edad máxima en milisegundos (default: 1 hora)
 */
export const cleanupOfflineUsers = (maxAge = 60 * 60 * 1000) => {
  const now = new Date();
  let cleaned = 0;
  
  for (const [userId, presence] of presenceStore.entries()) {
    if (presence.status === PresenceStatus.OFFLINE) {
      const lastActivity = new Date(presence.lastActivity);
      const age = now - lastActivity;
      
      if (age > maxAge) {
        presenceStore.delete(userId);
        cleaned++;
      }
    }
  }
  
  console.log(`[PresenceService] Limpiados ${cleaned} usuarios offline`);
  return cleaned;
};

/**
 * Obtiene el estado de presencia de múltiples usuarios
 * @param {Array<string>} userIds - IDs de usuarios
 * @returns {Object} Mapa de presencia
 */
export const getBulkPresence = (userIds) => {
  const result = {};
  for (const userId of userIds) {
    result[userId] = getPresence(userId);
  }
  return result;
};

/**
 * Obtiene usuarios por rol
 * @param {string} role - Rol
 * @returns {Array} Usuarios con ese rol
 */
export const getUsersByRole = (role) => {
  const users = [];
  for (const [userId, presence] of presenceStore.entries()) {
    if (presence.metadata.role === role) {
      users.push(presence);
    }
  }
  return users;
};

/**
 * Obtiene empleados en turno
 * @returns {Array} Empleados en turno
 */
export const getWorkingEmployees = () => {
  const users = [];
  for (const [userId, presence] of presenceStore.entries()) {
    if (presence.status === PresenceStatus.WORKING || presence.status === PresenceStatus.BREAK) {
      users.push(presence);
    }
  }
  return users;
};
