import { Router } from "express";

import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,

  /* NUEVO */
  getRecipeProtocol,
  getRecipesByProduct,
} from "../controllers/recipe.controller.js";

const router = Router();

/* ================================
   BASIC CRUD
================================ */
router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.post("/", createRecipe);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);

/* ================================
   BARTENDER FEATURES (NEW)
================================ */

/**
 * 🔬 PROTOCOL VIEW
 * Devuelve receta + pasos estructurados para el "mapa de preparación"
 */
router.get("/:id/protocol", getRecipeProtocol);

/**
 * 🍸 RECETAS POR PRODUCTO
 * útil para el product system (cocktail builder)
 */
router.get("/product/:productId", getRecipesByProduct);

export default router;