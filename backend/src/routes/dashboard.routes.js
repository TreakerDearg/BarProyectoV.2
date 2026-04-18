import { Router } from "express";

import {
  getDashboardStats,
} from "../controllers/dashboard.controller.js";

const router = Router();

/* ==============================
   CORE DASHBOARD
============================== */

/**
 *  Dashboard general (todo en uno)
 */
router.get("/", getDashboardStats);

/* ==============================
   FUTURO ESCALADO (READY)
============================== */

/**
 *  Solo ventas (para gráficos grandes)
 * (futuro endpoint separado si se necesitan datos más específicos o pesados)
 */
router.get("/sales", getDashboardStats);

/**
 *  Solo bebidas
 */
router.get("/drinks", getDashboardStats);

/**
 *  Solo comida
 */
router.get("/food", getDashboardStats);

/**
 *  Estado de mesas
 */
router.get("/tables", getDashboardStats);

/**
 *  Estado de inventario
 */
router.get("/inventory", getDashboardStats);

/**
 *  Dashboard live (para polling / websockets)
 */
router.get("/live", getDashboardStats);

export default router;