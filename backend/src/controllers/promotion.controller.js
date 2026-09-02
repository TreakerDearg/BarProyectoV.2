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
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $exists: false } },
        { startDate: { $exists: false }, endDate: { $gte: now } },
      ]
    })
    .populate("applicableProducts", "name price image available")
    .sort({ createdAt: -1 });

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
        available: p.available,
      })) || [],
      applicableCategories: promo.applicableCategories || [],
      schedule: promo.schedule ? {
        daysOfWeek: promo.schedule.daysOfWeek || [],
        startTime: promo.schedule.startTime,
        endTime: promo.schedule.endTime,
        startDate: promo.schedule.startDate,
        endDate: promo.schedule.endDate,
      } : null,
      active: promo.isActive,
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

/* =========================================================
   UPDATE PROMOTION — PUT /:id
   Edita todos los campos de una promoción existente.
========================================================= */
export const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ALLOWED = [
      "name", "description", "type", "value",
      "schedule", "applicableProducts", "applicableCategories", "isActive",
    ];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    if (Object.keys(updates).length === 0) {
      return badRequest(res, "No hay campos válidos para actualizar");
    }

    const promotion = await Promotion.findByIdAndUpdate(
      id, updates, { new: true, runValidators: true }
    ).populate("applicableProducts", "name price image available");

    if (!promotion) return notFound(res, "Promoción no encontrada");

    await PricingEvent.create({
      type: "PROMOTION_ACTIVATED",
      title: "Promoción actualizada",
      detail: `Promoción '${promotion.name}' actualizada.`,
      level: "info",
      createdBy: req.user.id,
    }).catch(() => {}); // No fallar si PricingEvent falla

    return ok(res, promotion, "Promoción actualizada correctamente");
  } catch (error) { throw error; }
};

/* =========================================================
   TOGGLE PROMOTION — PATCH /:id/toggle
   Activa o desactiva sin eliminar.
========================================================= */
export const togglePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findById(id);
    if (!promotion) return notFound(res, "Promoción no encontrada");

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    const action = promotion.isActive ? "activada" : "desactivada";

    await PricingEvent.create({
      type: "PROMOTION_ACTIVATED",
      title: `Promoción ${action}`,
      detail: `Promoción '${promotion.name}' ${action} por ${req.user.name || req.user.id}.`,
      level: promotion.isActive ? "info" : "warning",
      createdBy: req.user.id,
    }).catch(() => {});

    return ok(res, { isActive: promotion.isActive }, `Promoción ${action} correctamente`);
  } catch (error) { throw error; }
};

export const deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return notFound(res, "Promoción no encontrada");
    return ok(res, null, "Promoción eliminada");
  } catch (error) { throw error; }
};
