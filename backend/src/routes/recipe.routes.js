import { Router } from "express";

import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,

  getRecipeProtocol,
  getRecipesByProduct,
  checkRecipeAvailability,
} from "../controllers/recipe.controller.js";

const router = Router();

/* ==============================
   BASE
============================== */

//  Listado
router.get("/", getRecipes);

//  Por producto (ANTES de :id para evitar conflicto)
router.get("/product/:productId", getRecipesByProduct);

/* ==============================
   OPERACIONES ESPECÍFICAS
============================== */

//  Protocolo de preparación
router.get("/:id/protocol", getRecipeProtocol);

//  Verificar disponibilidad de stock 
router.get("/:id/availability", checkRecipeAvailability);

/* ==============================
   CRUD
============================== */

//  Obtener una receta
router.get("/:id", getRecipe);

//  Crear
router.post("/", createRecipe);

// Actualizar (parcial)
router.patch("/:id", updateRecipe);

// Eliminar
router.delete("/:id", deleteRecipe);

export default router;