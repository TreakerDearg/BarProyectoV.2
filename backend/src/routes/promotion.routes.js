import express from "express";
import { getPromotions, createPromotion, deletePromotion, getPublicPromotions } from "../controllers/promotion.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public endpoint for client
router.get("/public", getPublicPromotions);

// Admin endpoints
router.get("/", protect, authorizeRoles("admin", "manager"), getPromotions);
router.post("/", protect, authorizeRoles("admin", "manager"), createPromotion);
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deletePromotion);

export default router;
