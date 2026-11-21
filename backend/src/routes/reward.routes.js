import { Router } from "express";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getPublicRewards,
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  getMyPoints,
  redeemReward,
  validateVoucher,
  claimVoucher,
  getRedemptionsHistory,
  getRewardsKpis,
} from "../controllers/reward.controller.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];
const staffOrAdmin = [protect, authorizeRoles("admin", "manager", "bartender", "waiter", "cashier")];

/* Rutas públicas y de cliente (App / Web) */
router.get("/public",       getPublicRewards);
router.get("/my-points",    protect, getMyPoints);
router.post("/redeem/:id",  protect, redeemReward);

/* Rutas operativas de validación y canje en barra / TPV */
router.get("/voucher/validate",  ...staffOrAdmin, validateVoucher);
router.post("/voucher/validate", ...staffOrAdmin, validateVoucher);
router.post("/voucher/claim",    ...staffOrAdmin, claimVoucher);

/* Rutas administrativas de gestión de fidelidad */
router.get("/kpis",         ...adminOnly, getRewardsKpis);
router.get("/redemptions",  ...adminOnly, getRedemptionsHistory);
router.get("/",             ...adminOnly, getRewards);
router.post("/",            ...adminOnly, createReward);
router.patch("/:id",        ...adminOnly, updateReward);
router.delete("/:id",       ...adminOnly, deleteReward);

export default router;
