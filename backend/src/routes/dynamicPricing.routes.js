import express from "express";
import { getRules, updateGlobalMultiplier, getAutoPromotionsStatus, toggleAutoPromotionsStatus } from "../controllers/dynamicPricing.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin", "manager"), getRules);
router.post("/multiplier", protect, authorizeRoles("admin", "manager"), updateGlobalMultiplier);
router.get("/auto-promotions", protect, authorizeRoles("admin", "manager"), getAutoPromotionsStatus);
router.post("/auto-promotions", protect, authorizeRoles("admin", "manager"), toggleAutoPromotionsStatus);

export default router;
