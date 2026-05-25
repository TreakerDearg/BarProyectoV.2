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
  createPayment
);

/* =========================================================
   READ PAYMENTS
========================================================= */
router.get(
  "/payment/:id",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getPaymentById
);

router.get(
  "/table/:tableId",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getTablePayments
);

router.get(
  "/session/:sessionId",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getSessionPayments
);

/* =========================================================
   RECEIPT
========================================================= */
router.get(
  "/payment/:id/receipt",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  generateReceipt
);

/* =========================================================
   REFUND (FUTURO - Requiere permiso especial)
========================================================= */
router.post(
  "/payment/:id/refund",
  protect,
  authorizePermissions("REFUND_PAYMENT"),
  refundPayment
);

/* =========================================================
   DASHBOARD ANALYTICS
========================================================= */
router.get(
  "/summary",
  protect,
  authorizeRoles("admin", "manager"),
  getPaymentsSummary
);

router.get(
  "/by-table",
  protect,
  authorizeRoles("admin", "manager"),
  getPaymentsByTable
);

/* =========================================================
   NEW PAYMENT METHODS
========================================================= */

/* Available payment methods */
router.get(
  "/methods/available",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getAvailablePaymentMethods
);

/* Split payment */
router.post(
  "/split",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  createSplitPayment
);

/* Partial payment */
router.post(
  "/partial",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  createPartialPayment
);

/* Card payment */
router.post(
  "/card",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  createCardPayment
);

export default router;
