import winston from "winston";
import path from "path";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

export const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    // consola
    new winston.transports.Console(),

    // errores
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // todo el tráfico
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});