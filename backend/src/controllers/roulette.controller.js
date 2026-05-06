import mongoose      from "mongoose";
import RouletteDrink from "../models/RouletteDrink.js";
import Product       from "../models/Product.js";
import { createLog } from "./rouletteLog.controller.js";
import { logger }    from "../config/logger.js";
import {
  ok, created, badRequest, notFound,
} from "../utils/response.js";

const isValidId   = (id)    => mongoose.Types.ObjectId.isValid(id);
const parseWeight = (value) => { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; };

/* =========================================================
   GET ALL
========================================================= */
/* Vista pública (web cliente): mismos datos que listado admin con solo activos */
export const getPublicRouletteDrinks = (req, res, next) => {
  req.query.activeOnly = "true";
  return getRouletteDrinks(req, res, next);
};

export const getRouletteDrinks = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = activeOnly === "true" ? { active: true, deleted: false } : {};

    const drinks = await RouletteDrink.find(filter)
      .populate("product", "name type available isActiveForPOS")
      .select("-__v")
      .lean();

    const sanitized    = drinks.map((d) => ({ ...d, weight: parseWeight(d.weight) || 1 }));
    const totalWeight  = sanitized.reduce((sum, d) => sum + d.weight, 0);
    const result       = sanitized.map((d) => ({
      ...d,
      probability: totalWeight ? +((d.weight / totalWeight) * 100).toFixed(2) : 0,
    }));

    return ok(res, result);
  } catch (error) { next(error); }
};

/* =========================================================
   CREATE / UPDATE (Simplified for brevity in this step)
========================================================= */
export const createRouletteDrink = async (req, res, next) => {
  try {
    const { name, weight, color, category, price, product, rarity, pityThreshold } = req.body;
    const drink = await RouletteDrink.create({
      name, weight, color, category, price, product, rarity, pityThreshold
    });
    return created(res, drink);
  } catch (error) { next(error); }
};

export const updateRouletteDrink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const drink = await RouletteDrink.findByIdAndUpdate(id, req.body, { new: true });
    return ok(res, drink);
  } catch (error) { next(error); }
};

export const deleteRouletteDrink = async (req, res, next) => {
  try {
    await RouletteDrink.findByIdAndUpdate(req.params.id, { deleted: true });
    return ok(res, null);
  } catch (error) { next(error); }
};

/* =========================================================
   SPIN ROULETTE (Advanced Pondered Algorithm)
========================================================= */
export const spinRoulette = async (req, res, next) => {
  try {
    // 1. Get active drinks and populate product stock
    const drinks = await RouletteDrink.find({ active: true, deleted: false })
      .populate("product", "stock")
      .lean();

    if (!drinks.length) return badRequest(res, "No hay tragos activos");

    // 2. Filter by stock (Operational Intelligence)
    const availableDrinks = drinks.filter(d => {
      if (!d.product) return true; // Si no tiene producto vinculado, siempre disponible
      return d.product.stock > 0;
    });

    if (!availableDrinks.length) return badRequest(res, "Todos los tragos de la ruleta están agotados");

    // 3. Apply weights and Rarity modifiers
    const RARITY_MODIFIERS = {
      COMMON: 1.0,
      RARE: 0.5,
      EPIC: 0.2,
      LEGENDARY: 0.05
    };

    const weightedList = availableDrinks.map(d => {
      const baseWeight = parseWeight(d.weight) || 1;
      const rarityMod = RARITY_MODIFIERS[d.rarity] || 1.0;
      return {
        ...d,
        calculatedWeight: baseWeight * rarityMod
      };
    });

    const totalWeight = weightedList.reduce((sum, d) => sum + d.calculatedWeight, 0);
    const random = Math.random() * totalWeight;
    let acc = 0, selected = weightedList[0];

    for (const d of weightedList) {
      acc += d.calculatedWeight;
      if (random <= acc) {
        selected = d;
        break;
      }
    }

    // 4. Async updates & logging
    RouletteDrink.updateOne(
      { _id: selected._id },
      { $inc: { totalSpins: 1 }, lastSelectedAt: new Date() }
    ).exec();

    await createLog({
      type: "spin",
      message: `[${selected.rarity}] Resultado: "${selected.name}"`,
      drinkId: selected._id,
      performedBy: req.user?.id || null,
      meta: { rarity: selected.rarity }
    });

    return ok(res, {
      result: selected,
      meta: { 
        totalOptions: weightedList.length, 
        totalWeight,
        rarity: selected.rarity 
      },
    });
  } catch (error) { next(error); }
};