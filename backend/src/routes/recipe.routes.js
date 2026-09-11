import { Router } from "express";
import {
  getRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe,
  getRecipeProtocol, getRecipesByProduct, checkRecipeAvailability,
  getRecipesWithVariants, getDrinkProductsWithRecipes,
  getDashboardStats, getDashboardRecent, getDashboardWarnings,
  getDashboardSuggestions, getRecipeAnalytics, getRecipeTimeline,
  createRecipeVariant, getRecipeLogs,
} from "../controllers/recipe.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.js";
import asyncHandler from "../middlewares/asyncHandler.js";

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
router.get("/dashboard/stats",       asyncHandler(getDashboardStats));
router.get("/dashboard/recent",      asyncHandler(getDashboardRecent));
router.get("/dashboard/warnings",    asyncHandler(getDashboardWarnings));
router.get("/dashboard/suggestions", asyncHandler(getDashboardSuggestions));
router.get("/dashboard/logs",        asyncHandler(getRecipeLogs));

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
   VARIANT OPERATIONS
========================================================= */
router.post("/:id/variants", ...adminOnly, createRecipeVariant);

/* =========================================================
   ADMIN CRUD
========================================================= */
// Nota: schema de receta en Zod puede ser complejo, se valida manualmente en controller por ahora
router.post("/", ...adminOnly, uploadSingle('image'), createRecipe);
router.patch("/:id", ...adminOnly, uploadSingle('image'), updateRecipe);
router.delete("/:id", ...adminOnly, deleteRecipe);

export default router;