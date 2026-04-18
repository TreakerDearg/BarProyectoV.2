import { Router } from "express";
import {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats,
  getInventoryCategories,
  adjustStock,
} from "../controllers/inventory.controller.js";

const router = Router();

/* ==============================
   INVENTORY BASE
============================== */

// Obtener inventario (con filtros)
router.get("/", getInventory);

// Estadísticas
router.get("/stats", getInventoryStats);

//  Categorías
router.get("/categories", getInventoryCategories);

/* ==============================
   OPERACIONES ESPECÍFICAS
============================== */

//  Ajuste de stock 
router.patch("/:id/stock", adjustStock);

/* ==============================
   CRUD
============================== */

//  Obtener uno
router.get("/:id", getInventoryItem);

//  Crear
router.post("/", createInventoryItem);

//  Actualizar (general)
router.patch("/:id", updateInventoryItem);

// Eliminar
router.delete("/:id", deleteInventoryItem);

export default router;