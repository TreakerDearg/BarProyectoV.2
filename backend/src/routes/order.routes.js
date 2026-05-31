import { Router } from "express";
import {
  getOrders, getOrderById, createOrder, updateOrderStatus,
  updateOrderItemStatus, deleteOrder, applyDiscount
} from "../controllers/order.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updateItemStatusSchema,
  applyDiscountSchema,
} from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   READ
========================================================= */
router.get("/", asyncHandler(getOrders));
router.get("/:id", asyncHandler(getOrderById));

/* =========================================================
   CREATE & UPDATE
========================================================= */
router.post("/", protect, validate(createOrderSchema), asyncHandler(createOrder));

router.patch("/:id/status", protect, validate(updateOrderStatusSchema), asyncHandler(updateOrderStatus));
router.patch("/:orderId/item/:itemId/status", protect, validate(updateItemStatusSchema), asyncHandler(updateOrderItemStatus));

/* =========================================================
   DISCOUNTS
========================================================= */

router.post("/:orderId/discount", protect, validate(applyDiscountSchema), asyncHandler(applyDiscount));

router.delete("/:orderId/discount/:discountId", ...adminOnly, (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

/* =========================================================
   DELETE
========================================================= */
router.delete("/:id", ...adminOnly, asyncHandler(deleteOrder));

export default router;