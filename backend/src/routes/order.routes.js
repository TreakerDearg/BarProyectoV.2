import { Router } from "express";

import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderItemStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

/* ==============================
   MIDDLEWARES
============================== */
import { validateObjectId } from "../middlewares/validateObjectId.js";

const router = Router();

/* ==============================
   BASE
============================== */

// listado con filtros (?status, ?table, ?sessionId)
router.get("/", getOrders);

/* ==============================
   CREACIÓN
============================== */

router.post("/", createOrder);

/* ==============================
   OPERACIONES
============================== */

// orden individual
router.get("/:id", validateObjectId("id"), getOrderById);

// actualizar estado global
router.patch(
  "/:id/status",
  validateObjectId("id"),
  updateOrderStatus
);

// actualizar estado de item
router.patch(
  "/:orderId/item/:itemId/status",
  validateObjectId("orderId"),
  validateObjectId("itemId"),
  updateOrderItemStatus
);

// eliminar orden
router.delete(
  "/:id",
  validateObjectId("id"),
  deleteOrder
);

export default router;