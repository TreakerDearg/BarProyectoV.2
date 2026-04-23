import express from "express";

import {
  createEmployee,
  getEmployees,
  getUser,
  updateUser,
  deactivateUser,
  activateUser,
  changePassword,
  updatePermissions,
  assignShift,
} from "../controllers/user.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* =========================================================
   EMPLOYEES (ADMIN ONLY)
========================================================= */

/**
 * Crear empleado (con role + shift + permissions)
 */
router.post(
  "/employees",
  protect,
  authorizeRoles("admin"),
  createEmployee
);

/**
 * Listar empleados
 * filtros:
 * ?role=bartender
 * ?shift=morning
 * ?active=true
 */
router.get(
  "/employees",
  protect,
  authorizeRoles("admin"),
  getEmployees
);

/* =========================================================
   USER CORE MANAGEMENT
========================================================= */

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
 * Actualizar usuario (role / shift / permissions / status)
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateUser
);

/* =========================================================
   SECURITY
========================================================= */

/**
 * Cambiar contraseña
 */
router.patch(
  "/:id/password",
  protect,
  authorizeRoles("admin"),
  changePassword
);

/* =========================================================
   STATUS CONTROL
========================================================= */

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
 * Activar usuario
 */
router.patch(
  "/:id/activate",
  protect,
  authorizeRoles("admin"),
  activateUser
);

/* =========================================================
   ACCESS SYSTEM 
========================================================= */

/**
 * Actualizar permisos dinámicos
 * (Sistema de módulos del frontend)
 */
router.patch(
  "/:id/permissions",
  protect,
  authorizeRoles("admin"),
  updatePermissions
);

/**
 * Asignar turno operativo
 * (morning / afternoon / night / event)
 */
router.patch(
  "/:id/shift",
  protect,
  authorizeRoles("admin"),
  assignShift
);

export default router;