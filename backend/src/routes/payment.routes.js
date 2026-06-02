import express from "express";
import {
  createPayment,
  createSessionCheckout,
  getPaymentById,
  getTablePayments,
  getSessionPayments,
  getAvailablePaymentMethods,
  createSplitPayment,
  createPartialPayment,
  createCardPayment,
  generateReceipt,
  refundPayment,
  getPaymentsSummary,
  getPaymentsByTable,
} from "../controllers/payment.controller.js";
import { protect, authorizeRoles, authorizePermissions } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { createSessionCheckoutSchema } from "../utils/schemas.js";

const router = express.Router();
const staffOnly = [protect, authorizeRoles("admin", "manager", "staff")];
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   CREATE PAYMENT (Cobro Estándar)
========================================================= */
router.post(
  "/",
  ...staffOnly,
  asyncHandler(createPayment)
);

/* =========================================================
   READ PAYMENTS
========================================================= */
router.get(
  "/payment/:id",
  ...staffOnly,
  asyncHandler(getPaymentById)
);

router.get(
  "/table/:tableId",
  ...staffOnly,
  asyncHandler(getTablePayments)
);

router.get(
  "/session/:sessionId",
  ...staffOnly,
  asyncHandler(getSessionPayments)
);

/* =========================================================
   DIGITAL RECEIPT
========================================================= */
router.get(
  "/payment/:id/receipt",
  ...staffOnly,
  asyncHandler(generateReceipt)
);

/* =========================================================
   ADMINISTRATIVE REFUNDS
========================================================= */
router.post(
  "/payment/:id/refund",
  protect,
  authorizePermissions("REFUND_PAYMENT"),
  asyncHandler(refundPayment)
);

/* =========================================================
   DASHBOARD ANALYTICS & REPORTS
========================================================= */
router.get(
  "/summary",
  ...adminOnly,
  asyncHandler(getPaymentsSummary)
);

router.get(
  "/by-table",
  ...adminOnly,
  asyncHandler(getPaymentsByTable)
);

/* =========================================================
   NEW INTEGRATED BILL-FLOWS
========================================================= */
router.get(
  "/methods/available",
  ...staffOnly,
  asyncHandler(getAvailablePaymentMethods)
);

router.post(
  "/split",
  ...staffOnly,
  asyncHandler(createSplitPayment)
);

router.post(
  "/partial",
  ...staffOnly,
  asyncHandler(createPartialPayment)
);

router.post(
  "/card",
  ...staffOnly,
  asyncHandler(createCardPayment)
);

router.post(
  "/session-checkout",
  ...staffOnly,
  validate(createSessionCheckoutSchema),
  asyncHandler(createSessionCheckout)
);

export default router;
