export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Error interno del servidor";

  /* ==============================
     LOG DETALLADO (DEV)
  ============================== */
  if (process.env.NODE_ENV !== "production") {
    console.error(" ERROR:", {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }

  /* ==============================
     MONGOOSE - CAST ERROR (ID inválido)
  ============================== */
  if (err.name === "CastError") {
    statusCode = 400;
    message = `ID inválido: ${err.value}`;
  }

  /* ==============================
     MONGOOSE - DUPLICATE KEY
  ============================== */
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `El valor '${err.keyValue[field]}' ya existe en ${field}`;
  }

  /* ==============================
     MONGOOSE - VALIDATION ERROR
  ============================== */
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  /* ==============================
     JWT - TOKEN INVÁLIDO
  ============================== */
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token inválido";
  }

  /* ==============================
     JWT - TOKEN EXPIRADO
  ============================== */
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expirado";
  }

  /* ==============================
     RESPUESTA FINAL
  ============================== */
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
};