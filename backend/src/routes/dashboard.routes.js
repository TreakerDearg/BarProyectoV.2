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
router.get("/sales", (req, res) => { req.query.mode = "sales"; return getDashboardStats(req, res); });
router.get("/drinks", (req, res) => { req.query.mode = "drinks"; return getDashboardStats(req, res); });
router.get("/food", (req, res) => { req.query.mode = "food"; return getDashboardStats(req, res); });
router.get("/tables", (req, res) => { req.query.mode = "tables"; return getDashboardStats(req, res); });
router.get("/inventory", (req, res) => { req.query.mode = "inventory"; return getDashboardStats(req, res); });
router.get("/live", (req, res) => { req.query.mode = "live"; return getDashboardStats(req, res); });

export default router;