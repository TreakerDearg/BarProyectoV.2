import DynamicPricingRule from "../models/DynamicPricingRule.js";
import PricingEvent from "../models/PricingEvent.js";
import { ok, badRequest } from "../utils/response.js";
import { logger } from "../config/logger.js";
import { io } from "../server.js";

export const getRules = async (req, res, next) => {
  try {
    const rules = await DynamicPricingRule.find().sort({ createdAt: -1 });
    return ok(res, rules);
  } catch (error) { next(error); }
};

export const updateGlobalMultiplier = async (req, res, next) => {
  try {
    const { multiplier } = req.body;
    if (multiplier === undefined || multiplier < 0.1) {
      return badRequest(res, "Multiplicador inválido");
    }

    let rule = await DynamicPricingRule.findOne({ name: "GLOBAL_BASE" });
    const oldMultiplier = rule ? rule.multiplier : 1.0;

    if (!rule) {
      rule = new DynamicPricingRule({
        name: "GLOBAL_BASE",
        multiplier,
        createdBy: req.user.id,
      });
    } else {
      rule.multiplier = multiplier;
      rule.createdBy = req.user.id;
    }

    await rule.save();

    // Log event
    await PricingEvent.create({
      type: "MULTIPLIER_CHANGE",
      title: "Base multiplier applied",
      detail: `${req.user.name} ajustó multiplicador global de ${oldMultiplier}x a ${multiplier}x.`,
      level: "ok",
      createdBy: req.user.id,
      metadata: { oldMultiplier, newMultiplier: multiplier }
    });

    // Notify clients via socket
    io.emit("pricing:multiplier_updated", { multiplier });

    return ok(res, rule, "Multiplicador actualizado correctamente");
  } catch (error) { next(error); }
};

export const getAutoPromotionsStatus = async (req, res, next) => {
  try {
    let rule = await DynamicPricingRule.findOne({ name: "GLOBAL_AUTO_PROMOTIONS" });
    if (!rule) {
      // If it doesn't exist, it defaults to true
      return ok(res, { isAutoPromotionsEnabled: true });
    }
    return ok(res, { isAutoPromotionsEnabled: rule.isActive });
  } catch (error) { next(error); }
};

export const toggleAutoPromotionsStatus = async (req, res, next) => {
  try {
    const { isEnabled } = req.body;
    let rule = await DynamicPricingRule.findOne({ name: "GLOBAL_AUTO_PROMOTIONS" });
    
    if (!rule) {
      rule = new DynamicPricingRule({
        name: "GLOBAL_AUTO_PROMOTIONS",
        multiplier: 1.0,
        isActive: isEnabled,
        createdBy: req.user.id,
      });
    } else {
      rule.isActive = isEnabled;
      rule.createdBy = req.user.id;
    }

    await rule.save();

    await PricingEvent.create({
      type: "SYSTEM_CONFIG",
      title: "Auto Promotions Switch",
      detail: `${req.user.name} ${isEnabled ? 'activó' : 'desactivó'} las promociones automáticas a nivel sistema.`,
      level: isEnabled ? "info" : "warn",
      createdBy: req.user.id,
      metadata: { autoPromotionsEnabled: isEnabled }
    });

    io.emit("pricing:auto_promotions_updated", { isAutoPromotionsEnabled: isEnabled });

    return ok(res, { isAutoPromotionsEnabled: rule.isActive }, `Promociones automáticas ${isEnabled ? 'activadas' : 'desactivadas'}`);
  } catch (error) { next(error); }
};
