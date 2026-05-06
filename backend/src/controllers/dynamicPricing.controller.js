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
