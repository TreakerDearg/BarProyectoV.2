/**
 * Socket.io Initialization Module
 * Inicializa y configura todos los namespaces y eventos de WebSocket
 */

import { logger } from "../config/logger.js";
import {
  setupTrackingEvents,
  emitActivityEvent,
  emitKPIEvent,
  emitAlertEvent,
  emitShiftEvent,
  emitMetricsEvent,
  emitDiscountEvent,
} from "./tracking.socket.js";

// Re-exportar funciones para uso directo en controladores
export {
  emitActivityEvent,
  emitKPIEvent,
  emitAlertEvent,
  emitShiftEvent,
  emitMetricsEvent,
  emitDiscountEvent,
};

// Variable global para almacenar la instancia de Socket.io
let ioInstance = null;

/**
 * Inicializa todos los namespaces de Socket.io
 * @param {Server} io - Instancia de Socket.io del servidor
 */
export const initializeSocketNamespaces = (io) => {
  try {
    logger.info("[Socket] Inicializando namespaces de WebSocket...");

    // Almacenar la instancia globalmente
    ioInstance = io;

    // Setup tracking namespace con todos los eventos
    const trackingNamespace = setupTrackingEvents(io);

    logger.info("[Socket] ✅ Namespace /tracking inicializado");
    
    // Exportar funciones helper para uso en controladores
    return {
      tracking: trackingNamespace,
      emitActivityEvent,
      emitKPIEvent,
      emitAlertEvent,
      emitShiftEvent,
      emitMetricsEvent,
      emitDiscountEvent,
    };
  } catch (error) {
    logger.error("[Socket] Error inicializando namespaces:", error);
    throw error;
  }
};

/**
 * Obtiene la instancia de Socket.io para uso en controladores
 * @returns {Server|null} Instancia de Socket.io o null si no está inicializada
 */
export const getIO = () => {
  return ioInstance;
};

/**
 * Middleware para validar conexiones WebSocket
 * @param {Object} socket - Instancia del socket
 * @param {Function} next - Función next de middleware
 */
export const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      logger.warn("[Socket Auth] Conexión sin token");
      // En producción, rechazar conexiones sin token
      // return next(new Error("Autenticación requerida"));
    }
    
    // Aquí puedes validar el token JWT si es necesario
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // socket.user = decoded;
    
    next();
  } catch (error) {
    logger.error("[Socket Auth] Error en middleware:", error);
    next(error);
  }
};

/**
 * Configuración de opciones de Socket.io
 */
export const socketConfig = {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.CLIENT_URL,
      process.env.DESKTOP_URL,
    ].filter(Boolean),
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 20000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
};

/**
 * Estadísticas de conexión WebSocket
 */
export const getSocketStats = (io) => {
  const trackingNamespace = io.of("/tracking");
  
  return {
    tracking: {
      connected: trackingNamespace.sockets.size,
      rooms: trackingNamespace.adapter.rooms.size,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Broadcast a todos los clientes conectados (útil para notificaciones del sistema)
 */
export const broadcastSystemNotification = (io, notification) => {
  const trackingNamespace = io.of("/tracking");
  trackingNamespace.emit("system:notification", notification);
  logger.info("[Socket] Notificación del sistema broadcasteada");
};

/**
 * Enviar notificación a un usuario específico
 */
export const sendUserNotification = (io, userId, notification) => {
  const trackingNamespace = io.of("/tracking");
  trackingNamespace.to(`user:${userId}`).emit("user:notification", notification);
  logger.info(`[Socket] Notificación enviada a usuario: ${userId}`);
};
