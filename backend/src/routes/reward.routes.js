import { Router } from "express";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getPublicRewards, getRewards, createReward, updateReward, deleteReward,
  getMyPoints, redeemReward,
} from "../controllers/reward.controller.js";

const router    = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

router.get("/public",       getPublicRewards);
router.get("/my-points",    protect, getMyPoints);
router.post("/redeem/:id",  protect, redeemReward);
router.get("/",             ...adminOnly, getRewards);
router.post("/",            ...adminOnly, createReward);
router.patch("/:id",        ...adminOnly, updateReward);
router.delete("/:id",       ...adminOnly, deleteReward);

export default router;
