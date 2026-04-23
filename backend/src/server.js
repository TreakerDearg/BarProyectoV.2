import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import http from "http";
import os from "os";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import { getDbStatus } from "./config/dbStatus.js";

dotenv.config();

/* =========================================================
   APP INIT
========================================================= */
const app = express();
const server = http.createServer(app);

/* =========================================================
   DB CONNECTION
========================================================= */
connectDB();

/* =========================================================
   SECURITY MIDDLEWARE
========================================================= */
app.use(helmet());

/* =========================================================
   TRUST PROXY (important for deploys)
========================================================= */
app.set("trust proxy", 1);

/* =========================================================
   BODY PARSER
========================================================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   CORS CONFIG (CLEAN + SAFE)
========================================================= */
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
  process.env.DESKTOP_URL,
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);

      return callback(new Error(`❌ CORS bloqueado: ${origin}`));
    },
    credentials: true,
  })
);

/* =========================================================
   ROUTE TRACKING (DEBUG ONLY)
========================================================= */
const routes = [];

const trackRoute = (method, path) => {
  routes.push({ method, path });
};

const wrap = (method, path, handler) => {
  trackRoute(method, path);
  return handler;
};

/* =========================================================
   BASE ROUTES
========================================================= */
app.get(
  "/",
  wrap("GET", "/", (req, res) => {
    res.send("🍸 Bartender API funcionando correctamente");
  })
);

app.get(
  "/api",
  wrap("GET", "/api", (req, res) => {
    res.json({
      message: "🍸 Bartender API activa",
      version: "1.0.0",
      routes: routes.length,
    });
  })
);

/* =========================================================
   HEALTH CHECK (PRO READY)
========================================================= */
app.get(
  "/health",
  wrap("GET", "/health", (req, res) => {
    const dbState = mongoose.connection.readyState;

    const memory = process.memoryUsage();

    res.json({
      status: dbState === 1 ? "OK" : "DEGRADED",

      database: {
        status: getDbStatus(),
      },

      system: {
        uptime: process.uptime(),
        node: process.version,
        platform: os.platform(),
      },

      memory: {
        rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      },

      api: {
        routes: routes.length,
      },

      timestamp: new Date().toISOString(),
    });
  })
);

/* =========================================================
   ROUTES DEBUG (DEV ONLY)
========================================================= */
app.get(
  "/routes",
  wrap("GET", "/routes", (req, res) => {
    res.json({
      total: routes.length,
      routes,
    });
  })
);

/* =========================================================
   IMPORT ROUTES
========================================================= */
import productRoutes from "./routes/product.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import recipeRoutes from "./routes/recipe.routes.js";
import orderRoutes from "./routes/order.routes.js";
import rouletteRoutes from "./routes/roulette.routes.js";
import tableRoutes from "./routes/table.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

/* =========================================================
   REGISTER ROUTES
========================================================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/roulette", rouletteRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* =========================================================
   SOCKET.IO SETUP
========================================================= */
export const io = new Server(server, {
  cors: {
    origin: [...allowedOrigins],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  /* =========================
     TABLE ROOMS
  ========================= */
  socket.on("join:table", (tableId) => {
    socket.join(`table:${tableId}`);
  });

  socket.on("leave:table", (tableId) => {
    socket.leave(`table:${tableId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

/* =========================================================
   404 HANDLER
========================================================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER (PRO STANDARD)
========================================================= */
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* =========================================================
   START SERVER
========================================================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});