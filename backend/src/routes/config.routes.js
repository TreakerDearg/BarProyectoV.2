import { Router } from "express";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getSystemConfig,
  updateSystemConfig,
  getHomeFeatured,
  updateHomeFeatured,
} from "../controllers/config.controller.js";

const router = Router();

// Destacados de inicio (Público para la web del cliente)
router.get("/home-featured", getHomeFeatured);

// Actualizar destacados de inicio (Solo admin y manager desde Desktop)
router.put("/home-featured", protect, authorizeRoles("admin", "manager"), updateHomeFeatured);

// Configuración general del bar/TPV
router.get("/", protect, getSystemConfig);
router.put("/", protect, authorizeRoles("admin", "manager"), updateSystemConfig);

export default router;
