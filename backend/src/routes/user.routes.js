import express from "express";
import {
  createEmployee,
  getEmployees,
  deactivateUser,
} from "../controllers/user.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

//  SOLO ADMIN

// Crear empleado
router.post(
  "/employees",
  protect,
  authorizeRoles("admin"),
  createEmployee
);

// Listar empleados
router.get(
  "/employees",
  protect,
  authorizeRoles("admin"),
  getEmployees
);

// Desactivar usuario
router.put(
  "/:id/deactivate",
  protect,
  authorizeRoles("admin"),
  deactivateUser
);

export default router;