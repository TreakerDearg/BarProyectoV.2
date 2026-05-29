/* =========================================================
   PAYMENT ROUTES V2 - FAIL-SAFE REBUILD
   Rutas de pagos reconstruidas sin asyncHandler
   Manejo de errores directo en el controlador
========================================================= */

import express from "express";
import {
  createPaymentV2,
  getPaymentByIdV2,
  getTablePaymentsV2,
  getSessionPaymentsV2,
  getAvailablePaymentMethodsV2,
  createSplitPaymentV2,
  createPartialPaymentV2,
  createCardPaymentV2
} from "../controllers/payment.controller.v2.js";
import { protect, authorizeRoles, authorizePermissions } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================================================
   CREATE PAYMENT - V2
========================================================= */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  createPaymentV2
);

/* =========================================================
   READ PAYMENTS - V2
========================================================= */
router.get(
  "/payment/:id",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getPaymentByIdV2
);

router.get(
  "/table/:tableId",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getTablePaymentsV2
);

router.get(
  "/session/:sessionId",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getSessionPaymentsV2
);

/* =========================================================
   AVAILABLE PAYMENT METHODS - V2
========================================================= */
router.get(
  "/methods/available",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  getAvailablePaymentMethodsV2
);

/* =========================================================
   SPLIT PAYMENT - V2
========================================================= */
router.post(
  "/split",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  createSplitPaymentV2
);

/* =========================================================
   PARTIAL PAYMENT - V2
========================================================= */
router.post(
  "/partial",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  createPartialPaymentV2
);

/* =========================================================
   CARD PAYMENT - V2
========================================================= */
router.post(
  "/card",
  protect,
  authorizeRoles("admin", "manager", "staff"),
  createCardPaymentV2
);

export default router;
