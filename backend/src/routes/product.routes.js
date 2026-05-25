import { Router } from "express";
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  syncProductAvailability, getProductStats, toggleProductAvailability,
  getProductsWithRecipes
} from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema, updateProductSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadFields } from "../middlewares/upload.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC / BASIC ROUTES
========================================================= */
router.get("/", getProducts);
router.get("/with-recipes", getProductsWithRecipes);
router.get("/stats", getProductStats);
router.get("/:id", getProduct);

/* =========================================================
   ADMIN / MANAGEMENT ROUTES
========================================================= */
router.post("/sync-availability", ...adminOnly, syncProductAvailability);
router.patch("/:id/toggle-availability", ...adminOnly, toggleProductAvailability);

router.post("/", ...adminOnly, uploadFields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]), validate(createProductSchema), createProduct);
router.put("/:id", ...adminOnly, uploadFields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]), validate(updateProductSchema), updateProduct);
router.delete("/:id", ...adminOnly, deleteProduct);

export default router;