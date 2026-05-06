import express from "express";
import { getPromotions, createPromotion, deletePromotion } from "../controllers/promotion.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin", "manager"), getPromotions);
router.post("/", protect, authorizeRoles("admin", "manager"), createPromotion);
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deletePromotion);

export default router;
