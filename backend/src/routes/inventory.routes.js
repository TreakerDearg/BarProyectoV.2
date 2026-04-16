import { Router } from "express";
import {
  getInventory,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getInventoryStats,
  getInventoryCategories,
} from "../controllers/inventory.controller.js";

const router = Router();

/* ==============================
   INVENTORY ROUTES
============================== */

// Obtener todos los ingredientes
router.get("/", getInventory);

// Obtener estadísticas del inventario
router.get("/stats", getInventoryStats);

// Obtener categorías únicas
router.get("/categories", getInventoryCategories);

// Obtener un ingrediente por ID
router.get("/:id", getIngredient);

// Crear un ingrediente
router.post("/", createIngredient);

// Actualizar un ingrediente
router.put("/:id", updateIngredient);

// Eliminar un ingrediente
router.delete("/:id", deleteIngredient);

export default router;