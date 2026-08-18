/**
 * Socket.io Initialization Module
 * Inicializa y configura todos los namespaces de eventos de WebSocket
 */

import { logger } from "../config/logger.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
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
    
    // Setup default namespace con autenticación real
    setupDefaultNamespace(io);

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
 * Setup del namespace default con autenticación real
 */
function setupDefaultNamespace(io) {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    logger.info("[Socket] Cliente conectado:", socket.id);

    // Handle room joins con autorización
    socket.on("join", async (data) => {
      try {
        const { rooms } = data;
        if (!Array.isArray(rooms)) return;

        const user = socket.user;
        const authorizedRooms = [];

        for (const room of rooms) {
          // Autorizar rooms específicos
          if (room.startsWith("user:")) {
            // Solo el usuario puede unirse a su propio room
            const targetUserId = room.replace("user:", "");
            if (user && user.id === targetUserId) {
              socket.join(room);
              authorizedRooms.push(room);
              logger.info(`[Socket] Usuario ${user.id} unido a room: ${room}`);
            } else {
              logger.warn(`[Socket] Intento no autorizado de unirse a ${room} por usuario ${user?.id}`);
            }
          } else if (room === "orders:global") {
            // Solo roles autorizados pueden ver todas las órdenes
            if (user && (user.role === "admin" || user.role === "manager" || user.role === "bartender" || user.role === "kitchen")) {
              socket.join(room);
              authorizedRooms.push(room);
              logger.info(`[Socket] Usuario ${user.id} (${user.role}) unido a orders:global`);
            } else {
              logger.warn(`[Socket] Usuario sin autorización para orders:global: ${user?.role}`);
            }
          } else if (room.startsWith("table:")) {
            // Unirse a room de mesa solo si tiene una sesión activa
            // TODO: Implementar validación de sesión de mesa
            socket.join(room);
            authorizedRooms.push(room);
            logger.info(`[Socket] Cliente unido a room: ${room}`);
          } else if (room.startsWith("role:")) {
            // Solo usuarios con ese rol pueden unirse
            const targetRole = room.replace("role:", "");
            if (user && user.role === targetRole) {
              socket.join(room);
              authorizedRooms.push(room);
              logger.info(`[Socket] Usuario ${user.id} unido a role: ${targetRole}`);
            } else {
              logger.warn(`[Socket] Usuario ${user?.role} intentó unirse a role: ${targetRole}`);
            }
          }
        }

        socket.emit("joined", { rooms: authorizedRooms });
      } catch (error) {
        logger.error("[Socket] Error en join:", error);
      }
    });

    // Handle room leaves
    socket.on("leave", (data) => {
      try {
        const { rooms } = data;
        if (!Array.isArray(rooms)) return;

        rooms.forEach(room => {
          socket.leave(room);
          logger.info(`[Socket] Cliente ${socket.id} dejó room: ${room}`);
        });
      } catch (error) {
        logger.error("[Socket] Error en leave:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      logger.info("[Socket] Cliente desconectado:", socket.id, reason);
    });
  });
}

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
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      logger.warn("[Socket Auth] Conexión sin token - permitiendo conexión sin autenticación para clientes públicos");
      // Permite conexión sin autenticación pero sin user
      socket.user = null;
      return next();
    }
    
    // Validar el token JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario completo
      const user = await User.findById(decoded.id).select(
        "_id name email role permissions isActive shift"
      );

      if (!user || !user.isActive) {
        logger.warn("[Socket Auth] Usuario inválido o inactivo");
        socket.user = null;
        return next();
      }

      // Adjuntar usuario al socket
      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        shift: user.shift,
        isActive: user.isActive,
        permissions: user.permissions || {},
      };

      logger.info(`[Socket Auth] Usuario autenticado: ${user.email} (${user.role})`);
    } catch (error) {
      logger.warn("[Socket Auth] Token inválido:", error.message);
      socket.user = null;
    }
    
    next();
  } catch (error) {
    logger.error("[Socket Auth] Error en middleware:", error);
    socket.user = null;
    next();
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
