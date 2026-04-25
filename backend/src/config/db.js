import mongoose from "mongoose";
import { logger } from "./logger.js";

/* =========================================================
   DB STATUS TRACKER
========================================================= */
let _status = "disconnected";

export const getDbStatus = () => _status;

const setStatus = (s) => {
  _status = s;
  logger.info(`[DB] Estado → ${s}`);
};

/* =========================================================
   CONNECT — con retry automático
========================================================= */
export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    logger.error("[DB] MONGO_URI no definida en .env");
    process.exit(1);
  }

  /* ----------- Opciones de conexión ----------- */
  const options = {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
  };

  /* ----------- Eventos Mongoose ----------- */
  mongoose.connection.on("connected", () => setStatus("connected"));
  mongoose.connection.on("disconnected", () => setStatus("disconnected"));
  mongoose.connection.on("error", (err) => {
    setStatus("error");
    logger.error(`[DB] Error de conexión: ${err.message}`);
  });

  /* ----------- Retry Loop ----------- */
  const MAX_RETRIES = 5;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(MONGO_URI, options);
      logger.info("🟢 MongoDB conectado correctamente");
      return;
    } catch (err) {
      attempt++;
      const wait = attempt * 3000;
      logger.warn(`[DB] Intento ${attempt}/${MAX_RETRIES} fallido. Reintentando en ${wait / 1000}s...`);

      if (attempt >= MAX_RETRIES) {
        logger.error("[DB] No se pudo conectar a MongoDB. Cerrando proceso.");
        process.exit(1);
      }

      await new Promise((res) => setTimeout(res, wait));
    }
  }
};