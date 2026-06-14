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

/* ==============================
   MENUS (CRUD OPERATIONS)
============================== */
export const menuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 operaciones por 15 minutos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Demasiadas operaciones de menú. Intenta más tarde.",
  },
});

/* ==============================
   PUBLIC MENUS (READ-ONLY)
============================== */
export const publicMenuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // máximo 300 consultas por 15 minutos por IP (más permisivo para lectura)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Demasiadas consultas. Intenta más tarde.",
  },
});