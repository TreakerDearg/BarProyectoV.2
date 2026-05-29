import Promotion from "../models/Promotion.js";
import PricingEvent from "../models/PricingEvent.js";
import { ok, badRequest, notFound } from "../utils/response.js";

export const getPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find().populate("applicableProducts").sort({ createdAt: -1 });
    return ok(res, promotions);
  } catch (error) { throw error; }
};

export const createPromotion = async (req, res, next) => {
  try {
    const promotion = new Promotion({
      ...req.body,
      createdBy: req.user.id,
    });

    await promotion.save();

    await PricingEvent.create({
      type: "PROMOTION_ACTIVATED",
      title: "Nueva promoción creada",
      detail: `Promoción '${promotion.name}' creada por ${req.user.name}.`,
      level: "info",
      createdBy: req.user.id,
    });

    return ok(res, promotion, "Promoción creada correctamente");
  } catch (error) { throw error; }
};

export const deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return notFound(res, "Promoción no encontrada");
    return ok(res, null, "Promoción eliminada");
  } catch (error) { throw error; }
};
