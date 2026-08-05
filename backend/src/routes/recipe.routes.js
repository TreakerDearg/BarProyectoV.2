import { Router } from "express";
import {
  getRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe,
  getRecipeProtocol, getRecipesByProduct, checkRecipeAvailability,
  getRecipesWithVariants, getDrinkProductsWithRecipes,
  getDashboardStats, getDashboardRecent, getDashboardWarnings,
  getDashboardSuggestions, getRecipeAnalytics, getRecipeTimeline
} from "../controllers/recipe.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   BASE (requiere auth para ver recetas)
========================================================= */
router.use(protect);

router.get("/", getRecipes);
router.get("/product/:productId", getRecipesByProduct);
router.get("/product/:productId/with-variants", getRecipesWithVariants);
router.get("/drinks/with-recipes", getDrinkProductsWithRecipes);

/* =========================================================
   DASHBOARD ENDPOINTS
========================================================= */
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/recent", getDashboardRecent);
router.get("/dashboard/warnings", getDashboardWarnings);
router.get("/dashboard/suggestions", getDashboardSuggestions);

/* =========================================================
   ANALYTICS ENDPOINTS
========================================================= */
router.get("/analytics/:id", getRecipeAnalytics);

/* =========================================================
   OPERACIONES ESPECÍFICAS
========================================================= */
router.get("/:id/protocol", getRecipeProtocol);
router.get("/:id/availability", checkRecipeAvailability);
router.get("/:id/timeline", getRecipeTimeline);
router.get("/:id", getRecipe);

/* =========================================================
   ADMIN CRUD
========================================================= */
// Nota: schema de receta en Zod puede ser complejo, se valida manualmente en controller por ahora
router.post("/", ...adminOnly, uploadSingle('image'), createRecipe);
router.patch("/:id", ...adminOnly, uploadSingle('image'), updateRecipe);
router.delete("/:id", ...adminOnly, deleteRecipe);

export default router;