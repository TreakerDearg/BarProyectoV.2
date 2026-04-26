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

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   READ
========================================================= */
router.get("/", getOrders);
router.get("/:id", getOrderById);

/* =========================================================
   CREATE & UPDATE
========================================================= */
router.post("/", protect, validate(createOrderSchema), createOrder);

router.patch("/:id/status", protect, validate(updateOrderStatusSchema), updateOrderStatus);
router.patch("/:orderId/item/:itemId/status", protect, validate(updateItemStatusSchema), updateOrderItemStatus);

/* =========================================================
   DISCOUNTS
========================================================= */

router.post("/:orderId/discount", protect, validate(applyDiscountSchema), applyDiscount);

router.delete("/:orderId/discount/:discountId", ...adminOnly, (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

/* =========================================================
   DELETE
========================================================= */
router.delete("/:id", ...adminOnly, deleteOrder);

export default router;