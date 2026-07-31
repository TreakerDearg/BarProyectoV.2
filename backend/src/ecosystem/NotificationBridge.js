/**
 * NOTIFICATION BRIDGE
 * Puente para notificaciones globales del ecosistema
 */

import { emitNotification } from './RealtimeEvents.js';

/**
 * Tipos de notificación
 */
export const NotificationType = Object.freeze({
  SESSION_EXPIRED: 'session_expired',
  NEW_DEVICE: 'new_device',
  PASSWORD_CHANGED: 'password_changed',
  PERMISSIONS_CHANGED: 'permissions_changed',
  SHIFT_STARTED: 'shift_started',
  SHIFT_ENDED: 'shift_ended',
  ROLE_CHANGED: 'role_changed',
  USER_LOCKED: 'user_locked',
  USER_UNLOCKED: 'user_unlocked',
  ACCOUNT_VERIFIED: 'account_verified',
  PAYMENT_RECEIVED: 'payment_received',
  ORDER_ASSIGNED: 'order_assigned',
  RESERVATION_CONFIRMED: 'reservation_confirmed',
});

/**
 * Prioridades de notificación
 */
export const NotificationPriority = Object.freeze({
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
});

/**
 * Envía una notificación a un usuario
 * @param {string} userId - ID del usuario
 * @param {string} type - Tipo de notificación
 * @param {string} title - Título de la notificación
 * @param {string} message - Mensaje de la notificación
 * @param {Object} data - Datos adicionales
 * @param {string} priority - Prioridad
 */
export const sendNotification = (userId, type, title, message, data = {}, priority = NotificationPriority.NORMAL) => {
  try {
    emitNotification(userId, type, {
      title,
      message,
      data,
      priority,
      timestamp: new Date().toISOString(),
    });

    console.log(`[NotificationBridge] Notificación ${type} enviada a usuario ${userId}`);
  } catch (error) {
    console.error('[NotificationBridge] Error al enviar notificación:', error);
  }
};

/**
 * Notifica que la sesión expiró
 * @param {string} userId - ID del usuario
 * @param {string} sessionId - ID de sesión
 */
export const notifySessionExpired = (userId, sessionId) => {
  sendNotification(
    userId,
    NotificationType.SESSION_EXPIRED,
    'Sesión Expirada',
    'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    { sessionId },
    NotificationPriority.HIGH
  );
};

/**
 * Notifica un nuevo dispositivo
 * @param {string} userId - ID del usuario
 * @param {Object} deviceInfo - Información del dispositivo
 */
export const notifyNewDevice = (userId, deviceInfo) => {
  const deviceName = deviceInfo.deviceName || deviceInfo.platform;
  sendNotification(
    userId,
    NotificationType.NEW_DEVICE,
    'Nuevo Dispositivo',
    `Se ha iniciado sesión desde ${deviceName}. Si no fuiste tú, cambia tu contraseña.`,
    { deviceInfo },
    NotificationPriority.HIGH
  );
};

/**
 * Notifica que la contraseña fue cambiada
 * @param {string} userId - ID del usuario
 */
export const notifyPasswordChanged = (userId) => {
  sendNotification(
    userId,
    NotificationType.PASSWORD_CHANGED,
    'Contraseña Cambiada',
    'Tu contraseña ha sido cambiada exitosamente.',
    {},
    NotificationPriority.NORMAL
  );
};

/**
 * Notifica que los permisos cambiaron
 * @param {string} userId - ID del usuario
 * @param {Array<string>} newPermissions - Nuevos permisos
 */
export const notifyPermissionsChanged = (userId, newPermissions) => {
  sendNotification(
    userId,
    NotificationType.PERMISSIONS_CHANGED,
    'Permisos Actualizados',
    'Tus permisos han sido actualizados. Algunas funcionalidades pueden haber cambiado.',
    { newPermissions },
    NotificationPriority.NORMAL
  );
};

/**
 * Notifica que el turno comenzó
 * @param {string} userId - ID del usuario
 * @param {Object} shiftInfo - Información del turno
 */
export const notifyShiftStarted = (userId, shiftInfo) => {
  sendNotification(
    userId,
    NotificationType.SHIFT_STARTED,
    'Turno Iniciado',
    'Tu turno ha comenzado. ¡Buen trabajo!',
    { shiftInfo },
    NotificationPriority.NORMAL
  );
};

/**
 * Notifica que el turno finalizó
 * @param {string} userId - ID del usuario
 * @param {Object} shiftInfo - Información del turno
 */
export const notifyShiftEnded = (userId, shiftInfo) => {
  sendNotification(
    userId,
    NotificationType.SHIFT_ENDED,
    'Turno Finalizado',
    'Tu turno ha finalizado. ¡Buen descanso!',
    { shiftInfo },
    NotificationPriority.NORMAL
  );
};

/**
 * Notifica que el rol cambió
 * @param {string} userId - ID del usuario
 * @param {string} newRole - Nuevo rol
 */
export const notifyRoleChanged = (userId, newRole) => {
  sendNotification(
    userId,
    NotificationType.ROLE_CHANGED,
    'Rol Actualizado',
    `Tu rol ha sido cambiado a ${newRole}.`,
    { newRole },
    NotificationPriority.HIGH
  );
};

/**
 * Notifica que el usuario fue bloqueado
 * @param {string} userId - ID del usuario
 * @param {Object} lockInfo - Información del bloqueo
 */
export const notifyUserLocked = (userId, lockInfo) => {
  sendNotification(
    userId,
    NotificationType.USER_LOCKED,
    'Cuenta Bloqueada',
    'Tu cuenta ha sido bloqueada temporalmente. Contacta al administrador.',
    { lockInfo },
    NotificationPriority.URGENT
  );
};

/**
 * Notifica que el usuario fue desbloqueado
 * @param {string} userId - ID del usuario
 */
export const notifyUserUnlocked = (userId) => {
  sendNotification(
    userId,
    NotificationType.USER_UNLOCKED,
    'Cuenta Desbloqueada',
    'Tu cuenta ha sido desbloqueada. Ya puedes iniciar sesión.',
    {},
    NotificationPriority.HIGH
  );
};

/**
 * Notifica que la cuenta fue verificada
 * @param {string} userId - ID del usuario
 */
export const notifyAccountVerified = (userId) => {
  sendNotification(
    userId,
    NotificationType.ACCOUNT_VERIFIED,
    'Cuenta Verificada',
    'Tu cuenta ha sido verificada exitosamente.',
    {},
    NotificationPriority.NORMAL
  );
};

/**
 * Notifica que se recibió un pago
 * @param {string} userId - ID del usuario
 * @param {Object} paymentInfo - Información del pago
 */
export const notifyPaymentReceived = (userId, paymentInfo) => {
  sendNotification(
    userId,
    NotificationType.PAYMENT_RECEIVED,
    'Pago Recibido',
    `Se ha recibido un pago de $${paymentInfo.amount}.`,
    { paymentInfo },
    NotificationPriority.NORMAL
  );
};

/**
 * Notifica que se asignó una orden
 * @param {string} userId - ID del usuario
 * @param {Object} orderInfo - Información de la orden
 */
export const notifyOrderAssigned = (userId, orderInfo) => {
  sendNotification(
    userId,
    NotificationType.ORDER_ASSIGNED,
    'Nueva Orden Asignada',
    `Se te ha asignado la orden #${orderInfo.orderId}.`,
    { orderInfo },
    NotificationPriority.HIGH
  );
};

/**
 * Notifica que una reserva fue confirmada
 * @param {string} userId - ID del usuario
 * @param {Object} reservationInfo - Información de la reserva
 */
export const notifyReservationConfirmed = (userId, reservationInfo) => {
  sendNotification(
    userId,
    NotificationType.RESERVATION_CONFIRMED,
    'Reserva Confirmada',
    `Tu reserva para ${reservationInfo.date} ha sido confirmada.`,
    { reservationInfo },
    NotificationPriority.NORMAL
  );
};

/**
 * Envía una notificación personalizada
 * @param {string} userId - ID del usuario
 * @param {string} title - Título
 * @param {string} message - Mensaje
 * @param {Object} data - Datos adicionales
 */
export const sendCustomNotification = (userId, title, message, data = {}) => {
  sendNotification(
    userId,
    'custom',
    title,
    message,
    data,
    NotificationPriority.NORMAL
  );
};

/**
 * Envía una notificación de broadcast a múltiples usuarios
 * @param {Array<string>} userIds - IDs de usuarios
 * @param {string} type - Tipo de notificación
 * @param {string} title - Título
 * @param {string} message - Mensaje
 * @param {Object} data - Datos adicionales
 */
export const sendBroadcastNotification = (userIds, type, title, message, data = {}) => {
  for (const userId of userIds) {
    sendNotification(userId, type, title, message, data, NotificationPriority.NORMAL);
  }
  console.log(`[NotificationBridge] Broadcast enviado a ${userIds.length} usuarios`);
};
