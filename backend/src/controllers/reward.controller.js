import Reward from "../models/Reward.js";
import UserPoints from "../models/UserPoints.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { addPoints, deductPoints } from "../utils/points.js";
import { ok, created, badRequest, notFound } from "../utils/response.js";
import { logger } from "../config/logger.js";

/* =========================================================
   GET PUBLIC REWARDS (Cliente Web / Mobile)
   Active, non-deleted, within valid date window
========================================================= */
export const getPublicRewards = async (req, res, next) => {
  try {
    const now = new Date();

    const rewards = await Reward.find({ active: true, deleted: false })
      .populate("product", "name price category type isAvailable image")
      .lean();

    // Filter by date window
    const filtered = rewards.filter((r) => {
      if (r.validFrom && new Date(r.validFrom) > now) return false;
      if (r.validUntil && new Date(r.validUntil) < now) return false;
      return true;
    });

    return ok(res, filtered);
  } catch (error) { next(error); }
};

/* =========================================================
   GET ALL REWARDS (Admin Desktop)
========================================================= */
export const getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ deleted: false })
      .populate("product", "name price category type isAvailable image")
      .sort({ createdAt: -1 })
      .lean();
    return ok(res, rewards);
  } catch (error) { next(error); }
};

/* =========================================================
   CREATE REWARD
========================================================= */
export const createReward = async (req, res, next) => {
  try {
    const { name, pointsCost } = req.body;

    if (!name) return badRequest(res, "El nombre es requerido");
    if (!pointsCost) return badRequest(res, "El costo en puntos es requerido");

    const reward = await Reward.create(req.body);
    const populated = await Reward.findById(reward._id)
      .populate("product", "name price category type isAvailable image")
      .lean();

    logger.info(`[Reward] Recompensa creada: ${reward.name} (${reward._id})`);
    return created(res, populated);
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
      { returnDocument: 'after', runValidators: true }
    ).populate("product", "name price category type isAvailable image");

    if (!reward) return notFound(res, "Recompensa no encontrada");

    logger.info(`[Reward] Recompensa actualizada: ${reward.name} (${id})`);
    return ok(res, reward);
  } catch (error) { next(error); }
};

/* =========================================================
   DELETE REWARD (soft-delete)
========================================================= */
export const deleteReward = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reward = await Reward.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true, active: false },
      { returnDocument: 'after' }
    );

    if (!reward) return notFound(res, "Recompensa no encontrada");

    logger.info(`[Reward] Recompensa eliminada: ${id}`);
    return ok(res, { id, deleted: true });
  } catch (error) { next(error); }
};

/* =========================================================
   GET MY POINTS (Cliente)
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
   REDEEM REWARD (Generación de Cupón desde App / Cliente)
========================================================= */
export const redeemReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const now = new Date();

    const reward = await Reward.findOne({ _id: id, active: true, deleted: false })
      .populate("product", "name price category type isAvailable image");
    if (!reward) return notFound(res, "Recompensa no encontrada o inactiva");

    // Date validation
    if (reward.validFrom && new Date(reward.validFrom) > now) {
      return badRequest(res, "Esta recompensa aún no está disponible");
    }
    if (reward.validUntil && new Date(reward.validUntil) < now) {
      return badRequest(res, "Esta recompensa ha expirado");
    }

    // Stock validation
    if (reward.stock !== -1 && reward.stock <= 0) {
      return badRequest(res, "Recompensa agotada");
    }

    // Deduct points (throws if insufficient balance)
    const updatedPoints = await deductPoints(
      userId,
      reward.pointsCost,
      `Canje: ${reward.name}`,
      reward._id,
      "Reward"
    );

    // Generar código numérico/alfanumérico único de canje
    const voucherCode = `REW-${Math.floor(1000 + Math.random() * 9000)}`;

    // Push redemption record
    const redemptionItem = {
      user: userId,
      redeemedAt: now,
      orderId: null,
      code: voucherCode,
      status: "pending",
      claimedAt: null,
      claimedBy: null,
    };
    reward.redemptions.push(redemptionItem);

    // Decrement stock if finite
    if (reward.stock !== -1) {
      reward.stock -= 1;
      if (reward.stock <= 0) reward.active = false;
    }

    await reward.save();

    logger.info(`[Reward] Cupón generado: ${voucherCode} por usuario ${userId} para recompensa ${reward.name}`);

    return ok(res, {
      success: true,
      voucherCode,
      redemption: redemptionItem,
      newBalance: updatedPoints.balance,
      reward: reward.toObject(),
    });
  } catch (error) {
    if (error.message === "Saldo de puntos insuficiente") {
      return badRequest(res, error.message);
    }
    next(error);
  }
};

/* =========================================================
   VALIDATE VOUCHER (Validación en Barra / TPV)
========================================================= */
export const validateVoucher = async (req, res, next) => {
  try {
    const rawCode = req.query.code || req.body.code;
    if (!rawCode) return badRequest(res, "Código de cupón requerido");

    const code = rawCode.trim().toUpperCase();

    const reward = await Reward.findOne({
      "redemptions.code": code,
      deleted: false,
    }).populate("product", "name price category type isAvailable image");

    if (!reward) {
      return notFound(res, `No se encontró ningún cupón con el código ${code}`);
    }

    const redemption = reward.redemptions.find((r) => r.code === code);
    if (!redemption) {
      return notFound(res, "Cupón no encontrado en los registros");
    }

    const user = await User.findById(redemption.user).select("name email phone avatar");

    const itemCategoryLabel =
      reward.category === "drink" ? "Bebida" :
      reward.category === "food" ? "Comida" :
      reward.category === "discount" ? "Descuento" : "Experiencia";

    return ok(res, {
      valid: redemption.status === "pending",
      code: redemption.code,
      status: redemption.status,
      redeemedAt: redemption.redeemedAt,
      claimedAt: redemption.claimedAt,
      reward: {
        _id: reward._id,
        name: reward.name,
        category: reward.category,
        categoryLabel: itemCategoryLabel,
        pointsCost: reward.pointsCost,
        image: reward.image,
        product: reward.product,
      },
      user: user || { name: "Cliente no registrado" },
    });
  } catch (error) {
    logger.error("[Reward] Error al validar cupón:", error);
    next(error);
  }
};

/* =========================================================
   CLAIM VOUCHER (Canjear en Barra y Agregar a Comanda)
========================================================= */
export const claimVoucher = async (req, res, next) => {
  try {
    const { code: rawCode, orderId } = req.body;
    if (!rawCode) return badRequest(res, "Código de cupón requerido");

    const code = rawCode.trim().toUpperCase();

    const reward = await Reward.findOne({
      "redemptions.code": code,
      deleted: false,
    }).populate("product");

    if (!reward) return notFound(res, "Cupón no encontrado");

    const redemption = reward.redemptions.find((r) => r.code === code);
    if (!redemption) return notFound(res, "Cupón no registrado");

    if (redemption.status === "claimed") {
      return badRequest(res, `El cupón ${code} ya fue canjeado el ${new Date(redemption.claimedAt).toLocaleString()}`);
    }
    if (redemption.status === "cancelled") {
      return badRequest(res, `El cupón ${code} ha sido cancelado`);
    }

    // Marcar como entregado/canjeado
    redemption.status = "claimed";
    redemption.claimedAt = new Date();
    redemption.claimedBy = req.user?.id || null;

    let updatedOrder = null;

    // Si se pasa orderId, adjuntar el ítem a la comanda de forma separada
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        const itemCategoryLabel =
          reward.category === "drink" ? "Bebida" :
          reward.category === "food" ? "Comida" : "Recompensa";

        const rewardOrderItem = {
          product: reward.product?._id || null,
          name: `CANJE: ${reward.name} [${itemCategoryLabel}]`,
          quantity: 1,
          price: 0,
          type: reward.category === "food" ? "food" : "drink",
          isReward: true,
          rewardId: reward._id,
          rewardCode: code,
          rewardCategory: reward.category,
          status: "pending",
          notes: `Canje de fidelidad #${code} (Costo: ${reward.pointsCost} pts)`,
        };

        order.items.push(rewardOrderItem);
        redemption.orderId = order._id;
        await order.save();
        updatedOrder = order;
      }
    }

    await reward.save();

    logger.info(`[Reward] Cupón ${code} canjeado y procesado por ${req.user?.name || req.user?.id}`);

    return ok(res, {
      success: true,
      code,
      status: "claimed",
      claimedAt: redemption.claimedAt,
      rewardName: reward.name,
      order: updatedOrder,
    }, "Cupón canjeado exitosamente");
  } catch (error) {
    logger.error("[Reward] Error al procesar canje:", error);
    next(error);
  }
};

/* =========================================================
   GET REDEMPTIONS HISTORY (Auditoría Admin)
========================================================= */
export const getRedemptionsHistory = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ "redemptions.0": { $exists: true } })
      .populate("product", "name price category image")
      .populate("redemptions.user", "name email phone avatar")
      .populate("redemptions.claimedBy", "name email role")
      .lean();

    const flatRedemptions = [];

    rewards.forEach((reward) => {
      reward.redemptions.forEach((red) => {
        flatRedemptions.push({
          redemptionId: red._id,
          code: red.code || "S/C",
          status: red.status || "claimed",
          redeemedAt: red.redeemedAt,
          claimedAt: red.claimedAt,
          orderId: red.orderId,
          user: red.user || { name: "Cliente" },
          claimedBy: red.claimedBy,
          reward: {
            _id: reward._id,
            name: reward.name,
            pointsCost: reward.pointsCost,
            category: reward.category,
            product: reward.product,
          },
        });
      });
    });

    // Ordenar de más reciente a más antiguo
    flatRedemptions.sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt));

    return ok(res, flatRedemptions);
  } catch (error) {
    logger.error("[Reward] Error al obtener historial de canjes:", error);
    next(error);
  }
};

/* =========================================================
   GET REWARDS KPIS (Métricas del Programa)
========================================================= */
export const getRewardsKpis = async (req, res, next) => {
  try {
    const [rewards, pointsDocs] = await Promise.all([
      Reward.find({ deleted: false }).lean(),
      UserPoints.find().lean(),
    ]);

    const totalActiveRewards = rewards.filter((r) => r.active).length;

    let totalPointsInCirculation = 0;
    let totalPointsEarnedHistorical = 0;
    let totalPointsRedeemedHistorical = 0;

    pointsDocs.forEach((doc) => {
      totalPointsInCirculation += doc.balance || 0;
      totalPointsEarnedHistorical += doc.totalEarned || 0;
      totalPointsRedeemedHistorical += doc.totalRedeemed || 0;
    });

    let totalRedemptionsCount = 0;
    let claimedCount = 0;
    const popularityMap = {};

    rewards.forEach((r) => {
      const redCount = (r.redemptions || []).length;
      totalRedemptionsCount += redCount;
      (r.redemptions || []).forEach((red) => {
        if (red.status === "claimed") claimedCount++;
      });
      popularityMap[r.name] = (popularityMap[r.name] || 0) + redCount;
    });

    const topRewards = Object.entries(popularityMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return ok(res, {
      totalActiveRewards,
      totalRewards: rewards.length,
      totalPointsInCirculation,
      totalPointsEarnedHistorical,
      totalPointsRedeemedHistorical,
      totalRedemptionsCount,
      claimedCount,
      pendingCount: totalRedemptionsCount - claimedCount,
      topRewards,
    });
  } catch (error) {
    logger.error("[Reward] Error al obtener KPIs de recompensas:", error);
    next(error);
  }
};
