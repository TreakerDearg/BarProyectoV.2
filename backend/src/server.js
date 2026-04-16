import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import { connectDB } from "./config/db.js";

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


import { logger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

// 🔌 Conectar a la base de datos
connectDB();

const app = express();

/* ==============================
   CONFIGURACIÓN DE CORS
============================== */
const allowedOrigins = [
  "http://localhost:3000", // Next.js
  "http://localhost:5173", // Vite (Desktop)
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
  process.env.DESKTOP_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (Postman, Thunder Client, Electron)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS no permitido desde el origen: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ==============================
   MIDDLEWARES BASE
============================== */
app.use(helmet());          // Seguridad en headers
app.use(express.json());    // Parseo de JSON
app.use(logger);            // Logs personalizados

/* ==============================
   RUTAS DE PRUEBA
============================== */
app.get("/", (req, res) => {
  res.send("API Bartender funcionando 🍸");
});

app.get("/api", (req, res) => {
  res.json({
    message: "API Bartender en funcionamiento",
    version: "1.0.0",
  });
});

/* ==============================
   RUTAS PRINCIPALES
============================== */
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
app.use("/api/auth", authRoutes);

/* ==============================
   MANEJO DE ERRORES
============================== */
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
});

// Error global
app.use(errorHandler);

/* ==============================
   INICIO DEL SERVIDOR
============================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});