import express from "express";

import {
  loginUser,
  registerUser,
  getProfile,
} from "../controllers/auth.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================================================
   PUBLIC ROUTES
   (Sin autenticación)
========================================================= */

/**
 * Registro de clientes
 * - fuerza role: client en backend
 */
router.post("/register", registerUser);

/**
 * Login universal (admin + staff + client)
 */
router.post("/login", loginUser);

/* =========================================================
   PRIVATE ROUTES
   (JWT requerido)
========================================================= */

/**
 * Obtener perfil del usuario autenticado
 */
router.get("/me", protect, getProfile);

/**
 * Logout (stateless JWT)
 * - solo frontend elimina token
 */
router.post("/logout", protect, (req, res) => {
  return res.json({
    success: true,
    message: "Logout exitoso",
  });
});

/* =========================================================
   FUTURO / EXTENSIÓN (YA PREPARADO)
========================================================= */

/**
 * Endpoint solo admin (ejemplo base)
 * útil para testing de roles
 */
router.get(
  "/admin-check",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Acceso de admin confirmado",
      user: req.user,
    });
  }
);

export default router;