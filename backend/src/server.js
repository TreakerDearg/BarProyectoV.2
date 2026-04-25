import express    from "express";
import mongoose   from "mongoose";
import cors       from "cors";
import dotenv     from "dotenv";
import helmet     from "helmet";
import http       from "http";
import os         from "os";
import { Server } from "socket.io";

import { connectDB }    from "./config/db.js";
import { getDbStatus }  from "./config/dbStatus.js";
import { logger }       from "./config/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import apiRoutes        from "./routes/index.js";

dotenv.config();

/* =========================================================
   APP INIT
========================================================= */
const app    = express();
const server = http.createServer(app);

/* =========================================================
   DB CONNECTION
========================================================= */
connectDB();

/* =========================================================
   SECURITY MIDDLEWARE
========================================================= */
app.use(helmet({
  crossOriginEmbedderPolicy: false,  // Electron lo necesita desactivado
}));

app.set("trust proxy", 1);

/* =========================================================
   BODY PARSER
========================================================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   CORS CONFIG
========================================================= */
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
  process.env.DESKTOP_URL,
].filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      /* Electron no envía origin → permitir */
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);

      logger.warn(`[CORS] Bloqueado: ${origin}`);
      return callback(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
  })
);

/* =========================================================
   REQUEST LOGGER (dev)
========================================================= */
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    logger.info(`→ ${req.method} ${req.originalUrl}`);
    next();
  });
}

/* =========================================================
   BASE ROUTES
========================================================= */
app.get("/", (_req, res) => {
  res.send("🍸 Bartender API v2.0 funcionando correctamente");
});

/* =========================================================
   HEALTH CHECK
========================================================= */
app.get("/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const memory  = process.memoryUsage();

  res.json({
    status:   dbState === 1 ? "OK" : "DEGRADED",
    database: { status: getDbStatus(), state: dbState },
    system: {
      uptime:   `${Math.floor(process.uptime())}s`,
      node:     process.version,
      platform: os.platform(),
      hostname: os.hostname(),
    },
    memory: {
      rss:      `${(memory.rss      / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    },
    timestamp: new Date().toISOString(),
  });
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
    origin:      [...allowedOrigins],
    credentials: true,
  },
  /* Configuración de transporte optimizada */
  transports: ["websocket", "polling"],
  pingTimeout:  20000,
  pingInterval: 25000,
});

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
app.use(errorHandler);

/* =========================================================
   START SERVER
========================================================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Bartender API corriendo en http://localhost:${PORT}`);
  logger.info(`🌍 NODE_ENV: ${process.env.NODE_ENV || "development"}`);
});

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