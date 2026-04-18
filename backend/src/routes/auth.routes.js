import express from "express";

import {
  loginUser,
  registerUser,
  getProfile,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ==============================
   PUBLIC ROUTES
============================== */

/**
 * Registro (solo clientes)
 */
router.post("/register", registerUser);

/**
 * Login (clientes + empleados)
 */
router.post("/login", loginUser);

/* ==============================
   PRIVATE ROUTES
============================== */

/**
 * Obtener usuario autenticado
 */
router.get("/me", protect, getProfile);

/**
 * Logout (cliente limpia token)
 */
router.post("/logout", protect, (req, res) => {
  res.json({ message: "Logout exitoso" });
});

/* ==============================
   FUTURO (RECOMENDADO IMPLEMENTAR)
============================== */

/**
 * Refresh token (opcional)
 */
// router.post("/refresh", refreshToken);

export default router;