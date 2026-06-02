import express from "express";
import {
  applyDiscount, getOrderDiscounts, getAllDiscounts,
  approveDiscount, rejectDiscount, getDailyStats, checkDailyLimitRemaining,
  approveDiscountLevel1, approveDiscountLevel2, approveDiscountLevel3, getPendingApprovals, getFraudAlerts, exportDiscountReport
} from "../controllers/discount.controller.js";
import { validate } from "../middlewares/validate.js";
import { applyManualDiscountSchema } from "../utils/schemas.js";
import { protect, authorizeRoles, authorizePermissions } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================================================
   APPLY DISCOUNT
========================================================= */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "manager"),
  validate(applyManualDiscountSchema),
  applyDiscount
);

/* =========================================================
   READ
========================================================= */
router.get("/order/:orderId", protect, authorizeRoles("admin", "manager"), getOrderDiscounts);
router.get("/", protect, authorizeRoles("admin"), getAllDiscounts);

/* =========================================================
   STATS
========================================================= */
router.get("/stats/daily", protect, authorizeRoles("admin", "manager"), getDailyStats);
router.get("/limits/remaining", protect, checkDailyLimitRemaining);

/* =========================================================
   APPROVAL FLOW
========================================================= */
router.patch("/:id/approve", protect, authorizePermissions("APPROVE_DISCOUNT"), approveDiscount);
router.patch("/:id/reject", protect, authorizePermissions("APPROVE_DISCOUNT"), rejectDiscount);

/* =========================================================
   CASCADE APPROVAL
========================================================= */
router.get("/pending", protect, authorizeRoles("admin", "manager"), getPendingApprovals);
router.patch("/:id/approve-level-1", protect, authorizePermissions("APPROVE_DISCOUNT"), approveDiscountLevel1);
router.patch("/:id/approve-level-2", protect, authorizeRoles("admin"), approveDiscountLevel2);
router.patch("/:id/approve-level-3", protect, authorizeRoles("admin"), approveDiscountLevel3);

/* =========================================================
   FRAUD ALERTS
========================================================= */
router.get("/fraud-alerts", protect, authorizeRoles("admin", "manager"), getFraudAlerts);

/* =========================================================
   EXPORT REPORTS
========================================================= */
router.get("/export", protect, authorizeRoles("admin", "manager"), exportDiscountReport);

export default router;