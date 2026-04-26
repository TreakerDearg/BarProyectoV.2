import express from "express";
import {
  applyDiscount, getOrderDiscounts, getAllDiscounts,
  approveDiscount, rejectDiscount
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
   APPROVAL FLOW
========================================================= */
router.patch("/:id/approve", protect, authorizePermissions("APPROVE_DISCOUNT"), approveDiscount);
router.patch("/:id/reject", protect, authorizePermissions("APPROVE_DISCOUNT"), rejectDiscount);

export default router;