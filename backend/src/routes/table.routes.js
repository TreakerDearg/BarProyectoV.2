import { Router } from "express";
import {
  getTables, getTableById, createTable, updateTable, deleteTable,
  openTable, closeTable, addTableTag, removeTableTag, clearTableTags,
  getTableAnalytics, getTableAnalyticsById, generateTableAnalytics, getTablePerformanceRanking
} from "../controllers/table.controller.js";
import { validate } from "../middlewares/validate.js";
import { createTableSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   READ ROUTES (PUBLIC ACCESS FOR VIEWING)
========================================================= */
router.get("/", asyncHandler(getTables));
router.get("/:id", asyncHandler(getTableById));

/* =========================================================
   POS FLOW (abrir/cerrar mesa) - AUTHENTICATED ACCESS
========================================================= */
router.post("/:id/open", protect, asyncHandler(openTable));
router.post("/:id/close", protect, asyncHandler(closeTable));

/* =========================================================
   CRUD TABLES (ADMIN ONLY)
========================================================= */
router.post("/", ...adminOnly, validate(createTableSchema), asyncHandler(createTable));
router.put("/:id", ...adminOnly, asyncHandler(updateTable));
router.delete("/:id", ...adminOnly, asyncHandler(deleteTable));

/* =========================================================
   TAGS
========================================================= */
router.post("/:id/tags", asyncHandler(addTableTag));
router.delete("/:id/tags/:label", asyncHandler(removeTableTag));
router.delete("/:id/tags", asyncHandler(clearTableTags));

/* =========================================================
   ANALYTICS ROUTES
========================================================= */
router.get(
  "/analytics",
  // protect,
  // authorizeRoles("admin", "manager"),
  asyncHandler(getTableAnalytics)
);

router.get(
  "/:id/analytics",
  // protect,
  // authorizeRoles("admin", "manager"),
  asyncHandler(getTableAnalyticsById)
);

router.post(
  "/:id/analytics/generate",
  // protect,
  // authorizeRoles("admin", "manager"),
  asyncHandler(generateTableAnalytics)
);

router.get(
  "/analytics/ranking",
  // protect,
  // authorizeRoles("admin", "manager"),
  asyncHandler(getTablePerformanceRanking)
);

export default router;