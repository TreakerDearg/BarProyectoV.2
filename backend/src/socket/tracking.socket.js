import { logger } from "../config/logger.js";

/**
 * Tracking Socket Events Handler
 * Maneja todos los eventos de WebSocket relacionados con el sistema de tracking
 */

export const setupTrackingEvents = (io) => {
  const trackingNamespace = io.of("/tracking");

  // Middleware de autenticación para el namespace de tracking
  trackingNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    // Aquí puedes validar el token JWT si es necesario
    // Por ahora, permitimos la conexión para desarrollo
    if (!token) {
      logger.warn("[Tracking Socket] Conexión sin token de autenticación");
    }
    
    next();
  });

  trackingNamespace.on("connection", (socket) => {
    logger.info(`[Tracking Socket] Cliente conectado: ${socket.id}`);

    // ============================================================
    // SUSCRIPCIONES A ROOMS
    // ============================================================

    // Unirse a room de actividad en tiempo real
    socket.on("join:activity", (callback) => {
      socket.join("activity");
      logger.info(`[Tracking Socket] ${socket.id} se unió a room: activity`);
      callback?.({ success: true, room: "activity" });
    });

    // Unirse a room de KPIs
    socket.on("join:kpis", (userId, callback) => {
      const room = userId ? `kpis:${userId}` : "kpis:all";
      socket.join(room);
      logger.info(`[Tracking Socket] ${socket.id} se unió a room: ${room}`);
      callback?.({ success: true, room });
    });

    // Unirse a room de alertas
    socket.on("join:alerts", (callback) => {
      socket.join("alerts");
      logger.info(`[Tracking Socket] ${socket.id} se unió a room: alerts`);
      callback?.({ success: true, room: "alerts" });
    });

    // Unirse a room de turnos específicos
    socket.on("join:shifts", (shiftType, callback) => {
      const room = shiftType ? `shifts:${shiftType}` : "shifts:all";
      socket.join(room);
      logger.info(`[Tracking Socket] ${socket.id} se unió a room: ${room}`);
      callback?.({ success: true, room });
    });

    // Unirse a room de métricas
    socket.on("join:metrics", (callback) => {
      socket.join("metrics");
      logger.info(`[Tracking Socket] ${socket.id} se unió a room: metrics`);
      callback?.({ success: true, room: "metrics" });
    });

    // ============================================================
    // SALIR DE ROOMS
    // ============================================================

    socket.on("leave:activity", (callback) => {
      socket.leave("activity");
      logger.info(`[Tracking Socket] ${socket.id} salió de room: activity`);
      callback?.({ success: true });
    });

    socket.on("leave:kpis", (userId, callback) => {
      const room = userId ? `kpis:${userId}` : "kpis:all";
      socket.leave(room);
      logger.info(`[Tracking Socket] ${socket.id} salió de room: ${room}`);
      callback?.({ success: true });
    });

    socket.on("leave:alerts", (callback) => {
      socket.leave("alerts");
      logger.info(`[Tracking Socket] ${socket.id} salió de room: alerts`);
      callback?.({ success: true });
    });

    socket.on("leave:shifts", (shiftType, callback) => {
      const room = shiftType ? `shifts:${shiftType}` : "shifts:all";
      socket.leave(room);
      logger.info(`[Tracking Socket] ${socket.id} salió de room: ${room}`);
      callback?.({ success: true });
    });

    // ============================================================
    // PETICIONES DE DATOS
    // ============================================================

    // Solicitar actividad en tiempo real
    socket.on("request:realtime-activity", (filters, callback) => {
      // Este evento puede ser usado para solicitar datos iniciales
      // La respuesta se enviará a través del evento correspondiente
      logger.info(`[Tracking Socket] ${socket.id} solicitó actividad en tiempo real`);
      callback?.({ success: true, message: "Solicitud recibida" });
    });

    // Solicitar KPIs específicos
    socket.on("request:kpis", (userId, callback) => {
      logger.info(`[Tracking Socket] ${socket.id} solicitó KPIs para usuario: ${userId}`);
      callback?.({ success: true, message: "Solicitud recibida" });
    });

    // ============================================================
    // HEARTBEAT / PING
    // ============================================================

    socket.on("ping", (callback) => {
      callback?.({ pong: true, timestamp: new Date().toISOString() });
    });

    // ============================================================
    // DISCONEXIÓN
    // ============================================================

    socket.on("disconnect", (reason) => {
      logger.info(`[Tracking Socket] Cliente desconectado: ${socket.id}, razón: ${reason}`);
    });

    socket.on("error", (error) => {
      logger.error(`[Tracking Socket] Error en socket ${socket.id}:`, error);
    });
  });

  return trackingNamespace;
};

/**
 * Funciones helper para emitir eventos desde el servidor
 * Estas se usarán en los controladores para notificar a los clientes
 */

export const emitActivityEvent = (io, eventType, data) => {
  const trackingNamespace = io.of("/tracking");
  
  switch (eventType) {
    case "activity:new":
      // Nueva actividad registrada
      trackingNamespace.to("activity").emit("activity:new", data);
      logger.info(`[Tracking Socket] Emitido activity:new para room: activity`);
      break;
      
    case "activity:updated":
      // Actividad actualizada
      trackingNamespace.to("activity").emit("activity:updated", data);
      logger.info(`[Tracking Socket] Emitido activity:updated para room: activity`);
      break;
      
    default:
      logger.warn(`[Tracking Socket] Tipo de evento desconocido: ${eventType}`);
  }
};

export const emitKPIEvent = (io, eventType, data) => {
  const trackingNamespace = io.of("/tracking");
  
  switch (eventType) {
    case "kpi:update":
      // KPI actualizado para un usuario específico
      if (data.userId) {
        trackingNamespace.to(`kpis:${data.userId}`).emit("kpi:update", data);
        trackingNamespace.to("kpis:all").emit("kpi:update", data);
        logger.info(`[Tracking Socket] Emitido kpi:update para usuario: ${data.userId}`);
      }
      break;
      
    case "kpi:ranking":
      // Ranking de KPIs actualizado
      trackingNamespace.to("kpis:all").emit("kpi:ranking", data);
      logger.info(`[Tracking Socket] Emitido kpi:ranking para room: kpis:all`);
      break;
      
    default:
      logger.warn(`[Tracking Socket] Tipo de evento KPI desconocido: ${eventType}`);
  }
};

export const emitAlertEvent = (io, eventType, data) => {
  const trackingNamespace = io.of("/tracking");
  
  switch (eventType) {
    case "alert:create":
      // Nueva alerta creada
      trackingNamespace.to("alerts").emit("alert:create", data);
      logger.info(`[Tracking Socket] Emitido alert:create para room: alerts`);
      break;
      
    case "alert:resolve":
      // Alerta resuelta
      trackingNamespace.to("alerts").emit("alert:resolve", data);
      logger.info(`[Tracking Socket] Emitido alert:resolve para room: alerts`);
      break;
      
    case "alert:inventory":
      // Alerta de inventario
      trackingNamespace.to("alerts").emit("alert:create", data);
      logger.info(`[Tracking Socket] Emitido alert:inventory para room: alerts`);
      break;
      
    default:
      logger.warn(`[Tracking Socket] Tipo de evento alert desconocido: ${eventType}`);
  }
};

export const emitShiftEvent = (io, eventType, data) => {
  const trackingNamespace = io.of("/tracking");
  
  switch (eventType) {
    case "shift:created":
      // Nuevo turno creado
      trackingNamespace.to("shifts:all").emit("shift:created", data);
      if (data.shiftType) {
        trackingNamespace.to(`shifts:${data.shiftType}`).emit("shift:created", data);
      }
      logger.info(`[Tracking Socket] Emitido shift:created`);
      break;
      
    case "shift:updated":
      // Turno actualizado
      trackingNamespace.to("shifts:all").emit("shift:updated", data);
      if (data.shiftType) {
        trackingNamespace.to(`shifts:${data.shiftType}`).emit("shift:updated", data);
      }
      logger.info(`[Tracking Socket] Emitido shift:updated`);
      break;
      
    case "shift:deleted":
      // Turno eliminado
      trackingNamespace.to("shifts:all").emit("shift:deleted", data);
      if (data.shiftType) {
        trackingNamespace.to(`shifts:${data.shiftType}`).emit("shift:deleted", data);
      }
      logger.info(`[Tracking Socket] Emitido shift:deleted`);
      break;
      
    case "shift:assignment":
      // Nueva asignación de turno
      trackingNamespace.to("shifts:all").emit("shift:assignment", data);
      logger.info(`[Tracking Socket] Emitido shift:assignment`);
      break;
      
    case "shift:attendance":
      // Registro de asistencia (clock in/out)
      trackingNamespace.to("shifts:all").emit("shift:attendance", data);
      logger.info(`[Tracking Socket] Emitido shift:attendance`);
      break;
      
    default:
      logger.warn(`[Tracking Socket] Tipo de evento shift desconocido: ${eventType}`);
  }
};

export const emitMetricsEvent = (io, eventType, data) => {
  const trackingNamespace = io.of("/tracking");
  
  switch (eventType) {
    case "metrics:update":
      // Métricas actualizadas
      trackingNamespace.to("metrics").emit("metrics:update", data);
      logger.info(`[Tracking Socket] Emitido metrics:update para room: metrics`);
      break;
      
    case "metrics:peak-hours":
      // Horas pico actualizadas
      trackingNamespace.to("metrics").emit("metrics:peak-hours", data);
      logger.info(`[Tracking Socket] Emitido metrics:peak-hours para room: metrics`);
      break;
      
    default:
      logger.warn(`[Tracking Socket] Tipo de evento metrics desconocido: ${eventType}`);
  }
};

/**
 * Emitir eventos de descuentos
 */
export const emitDiscountEvent = (io, eventType, data) => {
  const trackingNamespace = io.of("/tracking");
  
  switch (eventType) {
    case "discount:applied":
      // Descuento aplicado
      trackingNamespace.to("activity").emit("discount:applied", data);
      trackingNamespace.to("alerts").emit("discount:applied", data);
      logger.info(`[Tracking Socket] Emitido discount:applied para rooms: activity, alerts`);
      break;
      
    default:
      logger.warn(`[Tracking Socket] Tipo de evento discount desconocido: ${eventType}`);
  }
};
