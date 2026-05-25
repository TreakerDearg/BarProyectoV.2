import { Router } from "express";
import {
  getUserPerformance,
  getPerformanceSummary,
  updatePerformance,
  getPerformanceRanking,
} from "../controllers/performance.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

/* =========================================================
   PERFORMANCE ROUTES
========================================================= */

// Get performance by user
router.get("/user/:userId", protect, authorizeRoles("admin", "manager"), getUserPerformance);

// Get performance summary by role
router.get("/summary", protect, authorizeRoles("admin", "manager"), getPerformanceSummary);

// Update performance metrics
router.patch("/user/:userId", protect, authorizeRoles("admin", "manager"), updatePerformance);

// Get performance ranking
router.get("/ranking", protect, authorizeRoles("admin", "manager"), getPerformanceRanking);

export default router;
