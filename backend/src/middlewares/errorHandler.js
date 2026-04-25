import { logger } from "../config/logger.js";

/* =========================================================
   GLOBAL ERROR HANDLER — Bartender System
   Captura todos los errores propagados por next(err)
   Formato unificado: { success, message, errors?, stack? }
========================================================= */
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message   || "Error interno del servidor";
  let errors     = null;

  /* ==============================
     LOG ESTRUCTURADO
  ============================== */
  logger.error(
    `[${req.method}] ${req.originalUrl} → ${statusCode} — ${message}`,
    {
      path:   req.originalUrl,
      method: req.method,
      body:   req.body,
      stack:  err.stack,
    }
  );

  /* ==============================
     MONGOOSE — CAST ERROR (ID inválido)
  ============================== */
  if (err.name === "CastError") {
    statusCode = 400;
    message = `ID inválido: ${err.value}`;
  }

  /* ==============================
     MONGOOSE — DUPLICATE KEY (e11000)
  ============================== */
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "campo";
    message = `El valor '${err.keyValue?.[field]}' ya existe en ${field}`;
  }

  /* ==============================
     MONGOOSE — VALIDATION ERROR
  ============================== */
  if (err.name === "ValidationError") {
    statusCode = 422;
    errors = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    message = "Error de validación";
  }

  /* ==============================
     ZOD — PARSE ERROR
  ============================== */
  if (err.name === "ZodError") {
    statusCode = 400;
    errors = err.errors.map((e) => ({
      field:   e.path.join("."),
      message: e.message,
    }));
    message = "Datos inválidos";
  }

  /* ==============================
     JWT — INVÁLIDO / EXPIRADO
  ============================== */
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token inválido";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expirado";
  }

  /* ==============================
     RESPUESTA FINAL
  ============================== */
  const payload = {
    success: false,
    message,
  };

  if (errors) payload.errors = errors;

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};