import express from "express";
import {
  getPromotions, createPromotion, updatePromotion,
  togglePromotion, deletePromotion, getPublicPromotions,
} from "../controllers/promotion.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = express.Router();
const adminOrManager = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC — accesible sin autenticación (cliente web)
========================================================= */
router.get("/public", asyncHandler(getPublicPromotions));

/* =========================================================
   ADMIN / MANAGER — gestión completa desde Desktop
========================================================= */
router.get(  "/",             ...adminOrManager, asyncHandler(getPromotions));
router.post( "/",             ...adminOrManager, asyncHandler(createPromotion));
router.put(  "/:id",          ...adminOrManager, asyncHandler(updatePromotion));
router.patch("/:id/toggle",   ...adminOrManager, asyncHandler(togglePromotion));
router.delete("/:id",         ...adminOrManager, asyncHandler(deletePromotion));

export default router;
