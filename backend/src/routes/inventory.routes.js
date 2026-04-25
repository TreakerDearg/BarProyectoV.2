import { Router } from "express";
import {
  getInventory, getInventoryItem, createInventoryItem,
  updateInventoryItem, deleteInventoryItem, getInventoryStats,
  getInventoryCategories, adjustStock
} from "../controllers/inventory.controller.js";
import { validate } from "../middlewares/validate.js";
import { createInventorySchema, adjustStockSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC / BASIC (requiere auth general al menos)
========================================================= */
router.use(protect); // Todo el inventario requiere autenticación

router.get("/", getInventory);
router.get("/stats", getInventoryStats);
router.get("/categories", getInventoryCategories);
router.get("/:id", getInventoryItem);

/* =========================================================
   ADMIN / MANAGEMENT
========================================================= */
router.post("/", ...adminOnly, validate(createInventorySchema), createInventoryItem);
router.patch("/:id/stock", ...adminOnly, validate(adjustStockSchema), adjustStock);

// Actualización general puede usar un schema parcial o permitimos body libre validado en controller
router.patch("/:id", ...adminOnly, updateInventoryItem);
router.delete("/:id", ...adminOnly, deleteInventoryItem);

export default router;