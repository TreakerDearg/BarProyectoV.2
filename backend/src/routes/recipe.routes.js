import { Router } from "express";
import {
  getRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe,
  getRecipeProtocol, getRecipesByProduct, checkRecipeAvailability
} from "../controllers/recipe.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   BASE (requiere auth para ver recetas)
========================================================= */
router.use(protect);

router.get("/", getRecipes);
router.get("/product/:productId", getRecipesByProduct);

/* =========================================================
   OPERACIONES ESPECÍFICAS
========================================================= */
router.get("/:id/protocol", getRecipeProtocol);
router.get("/:id/availability", checkRecipeAvailability);
router.get("/:id", getRecipe);

/* =========================================================
   ADMIN CRUD
========================================================= */
// Nota: schema de receta en Zod puede ser complejo, se valida manualmente en controller por ahora
router.post("/", ...adminOnly, createRecipe);
router.patch("/:id", ...adminOnly, updateRecipe);
router.delete("/:id", ...adminOnly, deleteRecipe);

export default router;