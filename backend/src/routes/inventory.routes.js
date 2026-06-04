import { Router } from "express";
import {
  getInventory, getInventoryItem, createInventoryItem,
  updateInventoryItem, deleteInventoryItem, getInventoryStats,
  getInventoryCategories, adjustStock, getInventoryWithProducts
} from "../controllers/inventory.controller.js";
import { validate } from "../middlewares/validate.js";
import { createInventorySchema, adjustStockSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC / BASIC (requiere auth general al menos)
========================================================= */
router.use(protect); // Todo el inventario requiere autenticación

router.get("/", getInventory);
router.get("/with-products", getInventoryWithProducts);
router.get("/stats", getInventoryStats);
router.get("/categories", getInventoryCategories);
router.get("/:id", getInventoryItem);

/* =========================================================
   ADMIN / MANAGEMENT
========================================================= */
router.post("/", ...adminOnly, uploadSingle('image'), validate(createInventorySchema), createInventoryItem);
router.patch("/:id/stock", ...adminOnly, validate(adjustStockSchema), adjustStock);

// Actualización general con soporte de imagen
router.patch("/:id", ...adminOnly, uploadSingle('image'), updateInventoryItem);
router.delete("/:id", ...adminOnly, deleteInventoryItem);

export default router;