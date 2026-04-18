import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import os from "os";

import { connectDB } from "./config/db.js";
import { getDbStatus } from "./config/dbStatus.js";

dotenv.config();

/* ==============================
   APP INIT
============================== */
const app = express();

/* ==============================
   DB CONNECTION
============================== */
connectDB();

/* ==============================
   TRUST PROXY
============================== */
app.set("trust proxy", 1);

/* ==============================
   SECURITY
============================== */
app.use(helmet());

/* ==============================
   CORS
============================== */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
  process.env.DESKTOP_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

/* ==============================
   BODY PARSER
============================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ==============================
   ROUTE TRACKER (SIMPLE + SAFE)
============================== */
const routes = [];

const track = (method, path) => {
  routes.push({ method, path });
};

/* helper wrapper */
const wrap = (method, path, handler) => {
  track(method, path);
  return handler;
};

/* ==============================
   BASE ROUTES
============================== */
app.get(
  "/",
  wrap("GET", "/", (req, res) => {
    res.send("API Bartender funcionando correctamente");
  })
);

app.get(
  "/api",
  wrap("GET", "/api", (req, res) => {
    res.json({
      message: "API Bartender activa",
      version: "1.0.0",
      totalRoutes: routes.length,
    });
  })
);

/* ==============================
   HEALTH CHECK
============================== */
app.get(
  "/health",
  wrap("GET", "/health", (req, res) => {
    const dbState = mongoose.connection.readyState;

    const dbMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const memory = process.memoryUsage();

    res.status(200).json({
      status: dbState === 1 ? "OK" : "DEGRADED",

      system: {
        uptime: process.uptime(),
        node: process.version,
        platform: os.platform(),
        memory: {
          rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
          heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        },
      },

      database: {
        status: getDbStatus(),
        raw: dbMap[dbState] || "unknown",
      },

      api: {
        totalRoutes: routes.length,
      },

      timestamp: new Date().toISOString(),
    });
  })
);

/* ==============================
   ROUTES DEBUG
============================== */
app.get(
  "/routes",
  wrap("GET", "/routes", (req, res) => {
    res.json({
      total: routes.length,
      routes,
    });
  })
);

/* ==============================
   IMPORT ROUTES
============================== */
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

/* ==============================
   REGISTER ROUTES
============================== */
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

/* ==============================
   404 HANDLER
============================== */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

/* ==============================
   GLOBAL ERROR HANDLER
============================== */
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* ==============================
   START SERVER
============================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Total routes tracked: ${routes.length}`);
});