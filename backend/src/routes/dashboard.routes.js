import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

/* =========================================================
   DASHBOARD (ADMIN ONLY)
========================================================= */
router.use(protect, authorizeRoles("admin", "manager"));

router.get("/", getDashboardStats);

/* =========================================================
   MODOS ESPECÍFICOS (FILTERED MODE)
========================================================= */
router.get("/sales", (req, res, next) => { req.query.mode = "sales"; return getDashboardStats(req, res, next); });
router.get("/drinks", (req, res, next) => { req.query.mode = "drinks"; return getDashboardStats(req, res, next); });
router.get("/food", (req, res, next) => { req.query.mode = "food"; return getDashboardStats(req, res, next); });
router.get("/tables", (req, res, next) => { req.query.mode = "tables"; return getDashboardStats(req, res, next); });
router.get("/inventory", (req, res, next) => { req.query.mode = "inventory"; return getDashboardStats(req, res, next); });
router.get("/live", (req, res, next) => { req.query.mode = "live"; return getDashboardStats(req, res, next); });

export default router;