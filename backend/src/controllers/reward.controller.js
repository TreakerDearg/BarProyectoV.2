import Reward     from "../models/Reward.js";
import UserPoints from "../models/UserPoints.js";
import { addPoints, deductPoints } from "../utils/points.js";
import {
  ok, created, badRequest, notFound,
} from "../utils/response.js";

/* =========================================================
   GET PUBLIC REWARDS
   Active, non-deleted, within valid date window (if set)
========================================================= */
export const getPublicRewards = async (req, res, next) => {
  try {
    const now = new Date();

    const rewards = await Reward.find({ active: true, deleted: false }).lean();

    // Filter by date window
    const filtered = rewards.filter((r) => {
      if (r.validFrom  && new Date(r.validFrom)  > now) return false;
      if (r.validUntil && new Date(r.validUntil) < now) return false;
      return true;
    });

    return ok(res, filtered);
  } catch (error) { next(error); }
};

/* =========================================================
   GET ALL REWARDS (admin)
========================================================= */
export const getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ deleted: false }).lean();
    return ok(res, rewards);
  } catch (error) { next(error); }
};

/* =========================================================
   CREATE REWARD
========================================================= */
export const createReward = async (req, res, next) => {
  try {
    const { name, pointsCost } = req.body;

    if (!name)       return badRequest(res, "El nombre es requerido");
    if (!pointsCost) return badRequest(res, "El costo en puntos es requerido");

    const reward = await Reward.create(req.body);
    return created(res, reward);
  } catch (error) { next(error); }
};

/* =========================================================
   UPDATE REWARD
========================================================= */
export const updateReward = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reward = await Reward.findOneAndUpdate(
      { _id: id, deleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reward) return notFound(res, "Recompensa no encontrada");

    return ok(res, reward);
  } catch (error) { next(error); }
};

/* =========================================================
   DELETE REWARD (soft)
========================================================= */
export const deleteReward = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reward = await Reward.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true, active: false },
      { new: true }
    );

    if (!reward) return notFound(res, "Recompensa no encontrada");

    return ok(res, { id, deleted: true });
  } catch (error) { next(error); }
};

/* =========================================================
   GET MY POINTS
========================================================= */
export const getMyPoints = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const doc = await UserPoints.findOne({ user: userId }).lean();

    if (!doc) {
      return ok(res, { balance: 0, totalEarned: 0, totalRedeemed: 0, movements: [] });
    }

    const last20 = (doc.movements || []).slice(-20).reverse();

    return ok(res, {
      balance:       doc.balance,
      totalEarned:   doc.totalEarned,
      totalRedeemed: doc.totalRedeemed,
      movements:     last20,
    });
  } catch (error) { next(error); }
};

/* =========================================================
   REDEEM REWARD
========================================================= */
export const redeemReward = async (req, res, next) => {
  try {
    const { id }   = req.params;
    const userId   = req.user.id;
    const now      = new Date();

    const reward = await Reward.findOne({ _id: id, active: true, deleted: false });
    if (!reward) return notFound(res, "Recompensa no encontrada o inactiva");

    // Date validation
    if (reward.validFrom  && new Date(reward.validFrom)  > now) return badRequest(res, "Esta recompensa aún no está disponible");
    if (reward.validUntil && new Date(reward.validUntil) < now) return badRequest(res, "Esta recompensa ha expirado");

    // Stock validation
    if (reward.stock !== -1 && reward.stock <= 0) return badRequest(res, "Recompensa agotada");

    // Deduct points (throws if insufficient balance)
    const updatedPoints = await deductPoints(
      userId,
      reward.pointsCost,
      `Canje: ${reward.name}`,
      reward._id,
      'Reward'
    );

    // Push redemption record
    reward.redemptions.push({ user: userId, redeemedAt: now });

    // Decrement stock if not unlimited
    if (reward.stock !== -1) {
      reward.stock -= 1;
      if (reward.stock <= 0) reward.active = false;
    }

    await reward.save();

    return ok(res, {
      success:    true,
      newBalance: updatedPoints.balance,
      reward:     reward.toObject(),
    });
  } catch (error) {
    if (error.message === "Saldo de puntos insuficiente") {
      return badRequest(res, error.message);
    }
    next(error);
  }
};
