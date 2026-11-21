import { Router } from "express";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { getSystemConfig, updateSystemConfig } from "../controllers/config.controller.js";

const router = Router();

// Cualquiera autenticado puede leer la configuración del bar/TPV
router.get("/", protect, getSystemConfig);

// Solo admin y manager pueden modificar la configuración
router.put("/", protect, authorizeRoles("admin", "manager"), updateSystemConfig);

export default router;
