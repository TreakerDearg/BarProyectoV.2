import { Router } from "express";

import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderItemStatus,
} from "../controllers/order.controller.js";

const router = Router();

/* ==============================
   BASE
============================== */

//  listado con filtros
router.get("/", getOrders);

/* ==============================
   OPERACIONES
============================== */

// una orden
router.get("/:id", getOrderById);

//  estado global
router.patch("/:id/status", updateOrderStatus);

//  estado por item (cocina/bar)
router.patch("/:orderId/item/:itemId/status", updateOrderItemStatus);

/* ==============================
   CREACIÓN
============================== */

router.post("/", createOrder);

export default router;