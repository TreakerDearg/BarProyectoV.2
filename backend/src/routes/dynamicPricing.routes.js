import express from "express";
import { getRules, updateGlobalMultiplier } from "../controllers/dynamicPricing.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin", "manager"), getRules);
router.post("/multiplier", protect, authorizeRoles("admin", "manager"), updateGlobalMultiplier);

export default router;
