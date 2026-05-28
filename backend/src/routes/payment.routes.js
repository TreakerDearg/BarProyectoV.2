import express from "express";
import {
  createPayment,
  getPaymentById,
  getTablePayments,
  getSessionPayments,
  generateReceipt,
  refundPayment,
  getPaymentsSummary,
  getPaymentsByTable,
  createSplitPayment,
  createPartialPayment,
  getAvailablePaymentMethods,
  createCardPayment,
} from "../controllers/payment.controller.js";
import { protect, authorizeRoles, authorizePermissions } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================================================
   CREATE PAYMENT
========================================================= */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  asyncHandler(createPayment)
);

/* =========================================================
   READ PAYMENTS
========================================================= */
router.get(
  "/payment/:id",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  asyncHandler(getPaymentById)
);

router.get(
  "/table/:tableId",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  asyncHandler(getTablePayments)
);

router.get(
  "/session/:sessionId",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  asyncHandler(getSessionPayments)
);

/* =========================================================
   RECEIPT
========================================================= */
router.get(
  "/payment/:id/receipt",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  asyncHandler(generateReceipt)
);

/* =========================================================
   REFUND (FUTURO - Requiere permiso especial)
========================================================= */
router.post(
  "/payment/:id/refund",
  protect,
  authorizePermissions("REFUND_PAYMENT"),
  asyncHandler(refundPayment)
);

/* =========================================================
   DASHBOARD ANALYTICS
========================================================= */
router.get(
  "/summary",
  protect,
  authorizeRoles("admin", "manager"),
  asyncHandler(getPaymentsSummary)
);

router.get(
  "/by-table",
  protect,
  authorizeRoles("admin", "manager"),
  asyncHandler(getPaymentsByTable)
);

/* =========================================================
   NEW PAYMENT METHODS
========================================================= */

/* Available payment methods */
router.get(
  "/methods/available",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  asyncHandler(getAvailablePaymentMethods)
);

/* Split payment */
router.post(
  "/split",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  asyncHandler(createSplitPayment)
);

/* Partial payment */
router.post(
  "/partial",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  asyncHandler(createPartialPayment)
);

/* Card payment */
router.post(
  "/card",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  asyncHandler(createCardPayment)
);

export default router;
