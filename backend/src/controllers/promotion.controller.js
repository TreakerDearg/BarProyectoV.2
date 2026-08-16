import Promotion from "../models/Promotion.js";
import PricingEvent from "../models/PricingEvent.js";
import { ok, badRequest, notFound } from "../utils/response.js";

export const getPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find().populate("applicableProducts").sort({ createdAt: -1 });
    return ok(res, promotions);
  } catch (error) { throw error; }
};

export const getPublicPromotions = async (req, res, next) => {
  try {
    const now = new Date();

    const promotions = await Promotion.find({
      isActive: true,
      $or: [
        // Sin restricción de fecha
        { startDate: { $exists: false }, endDate: { $exists: false } },
        // Dentro del rango de fechas
        {
          startDate: { $lte: now },
          endDate: { $gte: now }
        },
        // Solo startDate definido y ya pasó
        {
          startDate: { $lte: now },
          endDate: { $exists: false }
        },
        // Solo endDate definido y no ha pasado
        {
          startDate: { $exists: false },
          endDate: { $gte: now }
        }
      ]
    })
    .populate("applicableProducts", "name price image available")
    .sort({ createdAt: -1 });

    // Transformar a DTO público (ocultar campos internos)
    const publicPromotions = promotions.map(promo => ({
      id: promo._id.toString(),
      name: promo.name,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      applicableProducts: promo.applicableProducts?.map(p => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        image: p.image,
        available: p.available
      })) || [],
      applicableCategories: promo.applicableCategories || [],
      schedule: promo.schedule ? {
        daysOfWeek: promo.schedule.daysOfWeek || [],
        startTime: promo.schedule.startTime,
        endTime: promo.schedule.endTime,
        startDate: promo.schedule.startDate,
        endDate: promo.schedule.endDate
      } : null,
      active: promo.isActive
    }));

    return ok(res, publicPromotions);
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
