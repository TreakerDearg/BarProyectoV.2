import express from "express";

import {
  createEmployee,
  getEmployees,
  getUser,
  updateUser,
  deactivateUser,
  activateUser,
  changePassword,
} from "../controllers/user.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* ==============================
   EMPLOYEES (ADMIN ONLY)
============================== */

/**
 * Crear empleado
 */
router.post(
  "/employees",
  protect,
  authorizeRoles("admin"),
  createEmployee
);

/**
 * Listar empleados
 * Query:
 * ?role=bartender
 * ?active=true
 */
router.get(
  "/employees",
  protect,
  authorizeRoles("admin"),
  getEmployees
);

/* ==============================
   USER MANAGEMENT
============================== */

/**
 * Obtener usuario por ID
 */
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getUser
);

/**
 * Actualizar usuario
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateUser
);

/**
 * Cambiar contraseña
 */
router.patch(
  "/:id/password",
  protect,
  authorizeRoles("admin"),
  changePassword
);

/**
 * Desactivar usuario
 */
router.patch(
  "/:id/deactivate",
  protect,
  authorizeRoles("admin"),
  deactivateUser
);

/**
 * Reactivar usuario
 */
router.patch(
  "/:id/activate",
  protect,
  authorizeRoles("admin"),
  activateUser
);

export default router;