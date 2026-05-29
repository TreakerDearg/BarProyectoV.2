import express    from "express";
import mongoose   from "mongoose";
import cors       from "cors";
import dotenv     from "dotenv";
import http       from "http";
import { Server } from "socket.io";

import { connectDB }    from "./config/db.js";
import { logger }       from "./config/logger.js";
import apiRoutes        from "./routes/index.js";
import { initializeSocketEvents } from "./utils/socketEvents.js";
import { initializeSocketNamespaces } from "./socket/index.js";

// Importar middlewares mejorados
import {
  security,
  rateLimiters,
  enhancedLogger,
  metricsMiddlewares,
  healthCheckMiddleware,
  metricsEndpoint,
  prometheusMetricsEndpoint,
  alertsEndpoint,
  resetMetricsEndpoint,
  MiddlewareBuilder
} from "./middlewares/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

/* =========================================================
   APP INIT
========================================================= */
const app    = express();
const server = http.createServer(app);

/* =========================================================
   CORS CONFIGURATION (Must be first to handle preflight OPTIONS requests)
========================================================= */
const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set(
  [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://bar-proyecto-v-2-kns78t85g-treakerdeargs-projects.vercel.app",
    "https://barproyectov-2.onrender.com",
    process.env.CLIENT_URL,
    process.env.DESKTOP_URL,
    ...extraOrigins,
  ].filter(Boolean)
);

const isVercelPreviewOrigin = (origin = "") =>
  /^https:\/\/[a-z0-9-]+(\-[a-z0-9-]+)*\.vercel\.app$/i.test(origin);

const isAllowedOrigin = (origin) =>
  allowedOrigins.has(origin) || isVercelPreviewOrigin(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      /* Electron no envía origin → permitir */
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);

      logger.warn(`[CORS] Bloqueado: ${origin}`);
      return callback(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
  })
);

/* =========================================================
   DB CONNECTION
========================================================= */
connectDB();

/* =========================================================
   MIDDLEWARE CONFIGURATION
========================================================= */

// Determinar preset de middlewares según entorno
const env = process.env.NODE_ENV || 'development';
const middlewareBuilder = MiddlewareBuilder.create(env);

// Construir cadena de middlewares
const middlewares = middlewareBuilder.build();

// Aplicar middlewares con validación defensiva y debugging exhaustivo
middlewares.forEach((middleware, index) => {
  console.log("[Middleware Debug]", index, typeof middleware, middleware?.name || 'anonymous');

  if (typeof middleware === 'function') {
    // Verificar que tenga la firma correcta de Express
    const paramCount = middleware.length;
    console.log(`[Middleware Debug] ${index} - Function length (params): ${paramCount}`);

    if (paramCount < 2 || paramCount > 4) {
      console.error(`[Middleware Debug] ${index} - Invalid parameter count: ${paramCount} (expected 2-4)`);
    }

    app.use(middleware);
  } else {
    console.error("[Middleware inválido detectado]", index, typeof middleware, middleware);
    logger.error("[Server] Middleware inválido detectado", {
      index,
      type: typeof middleware,
      middleware: middleware?.toString?.() || middleware,
    });
  }
});

// =========================================================
// BODY PARSER

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   CORS CONFIG (Moved to the top)
========================================================= */
// CORS has been moved to the top of the file to ensure it intercepts all requests including preflights

/* =========================================================
   HEALTH CHECK & MONITORING ENDPOINTS
========================================================= */
app.get("/health", healthCheckMiddleware());
app.get("/metrics", metricsEndpoint);
app.get("/metrics/prometheus", prometheusMetricsEndpoint);
app.get("/alerts", alertsEndpoint);
app.post("/metrics/reset", resetMetricsEndpoint);

/* =========================================================
   BASE ROUTES
========================================================= */
app.get("/", (_req, res) => {
  res.send("🍸 Bartender API v3.0 funcionando correctamente");
});

/* =========================================================
   API ROUTES — Centralizadas en /api
========================================================= */
app.use("/api", apiRoutes);

/* =========================================================
   SOCKET.IO SETUP
========================================================= */
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqueado en Socket.IO: ${origin}`));
    },
    credentials: true,
  },
  /* Configuración de transporte optimizada */
  transports: ["websocket", "polling"],
  pingTimeout:  20000,
  pingInterval: 25000,
});

/* Inicializar eventos de Socket.IO */
initializeSocketEvents(io);

/* Inicializar namespaces de tracking */
initializeSocketNamespaces(io);

/* ─── SOCKET EVENTS ─── */
io.on("connection", (socket) => {
  logger.info(`[WS] Conectado → ${socket.id}`);

  /* TABLE ROOMS */
  socket.on("join:table",  (tableId) => {
    socket.join(`table:${tableId}`);
    logger.info(`[WS] ${socket.id} → sala table:${tableId}`);
  });

  socket.on("leave:table", (tableId) => {
    socket.leave(`table:${tableId}`);
  });

  /* ORDER ROOMS */
  socket.on("join:orders", () => {
    socket.join("orders:global");
  });

  /* KITCHEN / BAR ROOMS */
  socket.on("join:kitchen",    () => socket.join("role:kitchen"));
  socket.on("join:bartender",  () => socket.join("role:bartender"));

  /* PAYMENTS ROOMS */
  socket.on("join:payments", () => {
    socket.join("payments:global");
    logger.info(`[WS] ${socket.id} → sala payments:global`);
  });

  socket.on("join:table:payments", (tableId) => {
    socket.join(`table:${tableId}`);
    logger.info(`[WS] ${socket.id} → sala table:${tableId} (pagos)`);
  });

  /* USER ROOMS (para notificaciones personalizadas) */
  socket.on("join:user", (userId) => {
    socket.join(`user:${userId}`);
    logger.info(`[WS] ${socket.id} → sala user:${userId}`);
  });

  socket.on("leave:user", (userId) => {
    socket.leave(`user:${userId}`);
  });

  /* ROULETTE ROOMS */
  socket.on("join:roulette", () => {
    socket.join("roulette:global");
    logger.info(`[WS] ${socket.id} → sala roulette:global`);
  });

  socket.on("disconnect", (reason) => {
    logger.info(`[WS] Desconectado → ${socket.id} (${reason})`);
  });
});

/* =========================================================
   404 HANDLER
========================================================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path:    req.originalUrl,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */
console.log("errorHandler:", typeof errorHandler);
console.log("errorHandler.length:", errorHandler.length);
if (typeof errorHandler !== 'function') {
  console.error("[ERROR] errorHandler is not a function!");
} else if (errorHandler.length !== 4) {
  console.error(`[ERROR] errorHandler has ${errorHandler.length} parameters, expected 4 (err, req, res, next)`);
} else {
  console.log("[OK] errorHandler is a valid error handler with 4 parameters");
}
app.use(errorHandler);

/* =========================================================
   START SERVER
========================================================= */
const PORT = process.env.PORT || 5000;

try {
  server.listen(PORT, () => {
    logger.info(`🚀 Bartender API corriendo en http://localhost:${PORT}`);
    logger.info(`🌍 NODE_ENV: ${process.env.NODE_ENV || "development"}`);
    logger.info(`🔧 Middleware preset: ${env}`);
    logger.info(`📊 Métricas habilitadas: /metrics`);
    logger.info(`❤️ Health check: /health`);
  });
} catch (error) {
  logger.error('[Server] Error al iniciar el servidor:', error);
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
}

/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */
const shutdown = (signal) => {
  logger.info(`[Server] Señal ${signal} recibida. Cerrando servidor...`);
  server.close(async () => {
    await mongoose.connection.close();
    logger.info("[Server] Conexión cerrada correctamente.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('[Server] Uncaught Exception:', error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Server] Unhandled Rejection:', reason);
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

