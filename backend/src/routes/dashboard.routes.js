import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();

/* =========================================================
   CORE DASHBOARD (AGREGADO)
========================================================= */
router.get("/", getDashboardStats);

/* =========================================================
   MODOS ESPECÍFICOS (FILTERED MODE)
========================================================= */

/**
 * Solo ventas (menos carga)
 */
router.get("/sales", (req, res, next) => {
  req.query.mode = "sales";
  return getDashboardStats(req, res, next);
});

/**
 * Solo bebidas
 */
router.get("/drinks", (req, res, next) => {
  req.query.mode = "drinks";
  return getDashboardStats(req, res, next);
});

/**
 * Solo comida
 */
router.get("/food", (req, res, next) => {
  req.query.mode = "food";
  return getDashboardStats(req, res, next);
});

/**
 * Solo mesas
 */
router.get("/tables", (req, res, next) => {
  req.query.mode = "tables";
  return getDashboardStats(req, res, next);
});

/**
 * Solo inventario
 */
router.get("/inventory", (req, res, next) => {
  req.query.mode = "inventory";
  return getDashboardStats(req, res, next);
});

/* =========================================================
   LIVE DASHBOARD (FUTURO SOCKET/POLLING)
========================================================= */
router.get("/live", (req, res, next) => {
  req.query.mode = "live";
  return getDashboardStats(req, res, next);
});

export default router;