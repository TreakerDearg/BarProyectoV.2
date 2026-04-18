import rateLimit from "express-rate-limit";

/* ==============================
   API GENERAL LIMIT
============================== */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Demasiadas solicitudes, intenta más tarde.",
  },
});

/* ==============================
   AUTH (LOGIN / REGISTER)
============================== */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Demasiados intentos de autenticación, intenta más tarde.",
  },
});

/* ==============================
   ORDERS (CRÍTICO - BAR SYSTEM)
============================== */
export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // máximo 20 pedidos por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Estás enviando demasiados pedidos. Intenta más lento.",
  },
});