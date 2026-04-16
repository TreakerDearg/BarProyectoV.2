import { Router } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

// GET ALL
router.get("/", getOrders);

//  GET ONE ( CLAVE PARA STATUS PAGE)
router.get("/:id", getOrderById);

//  CREATE
router.post("/", createOrder);

//  UPDATE STATUS
router.patch("/:id/status", updateOrderStatus);

export default router;