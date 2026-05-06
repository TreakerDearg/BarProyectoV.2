import express from "express";
import { getPricingEvents } from "../controllers/pricingEvent.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin", "manager"), getPricingEvents);

export default router;
