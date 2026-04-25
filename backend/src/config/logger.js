import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR   = path.join(__dirname, "../../logs");

/* =========================================================
   COLORES POR NIVEL (consola)
========================================================= */
const LEVEL_COLORS = {
  error: "\x1b[31m",   // rojo
  warn:  "\x1b[33m",   // naranja/amarillo
  info:  "\x1b[36m",   // cian
  debug: "\x1b[90m",   // gris
  reset: "\x1b[0m",
};

/* =========================================================
   FORMAT — Consola con color
========================================================= */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    const color = LEVEL_COLORS[level] || "";
    const reset = LEVEL_COLORS.reset;
    return `${color}[${timestamp}] ${level.toUpperCase().padEnd(5)}${reset} ${message}`;
  })
);

/* =========================================================
   FORMAT — Archivo JSON estructurado
========================================================= */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/* =========================================================
   LOGGER INSTANCE
========================================================= */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "info",
  transports: [

    /* --- Consola (dev) --- */
    new winston.transports.Console({
      format: consoleFormat,
    }),

    /* --- Errores a archivo --- */
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,  // 5 MB
      maxFiles: 3,
    }),

    /* --- Todo el tráfico --- */
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    }),
  ],

  /* Excepciones no capturadas */
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, "exceptions.log"),
      format: fileFormat,
    }),
  ],
});

/* Promesas no capturadas */
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(LOG_DIR, "rejections.log"),
    format: fileFormat,
  })
);