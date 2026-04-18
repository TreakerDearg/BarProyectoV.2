import { Router } from "express";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  syncProductAvailability,
  getProductStats,
} from "../controllers/product.controller.js";

const router = Router();

/* ==============================
   BASE
============================== */

/**
 *  Obtener productos
 * Query:
 * ?type=drink | food
 * ?category=cocktails
 * ?available=true
 * ?tags=vegan,celiac
 * ?search=mojito
 */
router.get("/", getProducts);

/**
 *  Estadísticas ( dashboard)
 */
router.get("/stats", getProductStats);

/**
 *  Sincronizar disponibilidad
 */
router.post("/sync-availability", syncProductAvailability);

/**
 * Obtener un producto
 */
router.get("/:id", getProduct);

/* ==============================
   CRUD
============================== */

/**
 *  Crear producto
 */
router.post("/", createProduct);

/**
 *  Actualizar producto
 */
router.put("/:id", updateProduct);

/**
 *  Eliminar producto
 */
router.delete("/:id", deleteProduct);

export default router;