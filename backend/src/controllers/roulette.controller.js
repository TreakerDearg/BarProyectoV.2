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
   GET ALL (con probabilidad calculada)
========================================================= */
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
   CREATE
========================================================= */
export const createRouletteDrink = async (req, res, next) => {
  try {
    const { name, weight, color, category, price, product } = req.body;

    const parsedWeight = parseWeight(weight);
    if (!name)         return badRequest(res, "name es obligatorio");
    if (!parsedWeight) return badRequest(res, "weight debe ser un número positivo");

    let resolvedName = name;
    let resolvedPrice = price;
    let resolvedProduct = null;

    if (product) {
      if (!isValidId(product)) return badRequest(res, "product inválido");
      const productDoc = await Product.findById(product).lean();
      if (!productDoc) return badRequest(res, "Producto no encontrado");
      if (productDoc.type !== "drink") {
        return badRequest(res, "Solo productos tipo drink pueden estar en roulette");
      }

      resolvedProduct = productDoc._id;
      if (!resolvedName) resolvedName = productDoc.name;
      if (resolvedPrice === undefined || resolvedPrice === null) {
        resolvedPrice = productDoc.price;
      }
    }

    const drink = await RouletteDrink.create({
      product: resolvedProduct,
      name: resolvedName,
      weight: parsedWeight,
      color,
      category,
      price: resolvedPrice,
    });

    await createLog({
      type: "create",
      message: `"${drink.name}" agregado a la ruleta`,
      drinkId: drink._id,
      performedBy: req.user?.id || null,
    });
    logger.info(`[Roulette] Creado: ${drink.name}`);

    return created(res, drink, `"${drink.name}" agregado a la ruleta`);
  } catch (error) { next(error); }
};

/* =========================================================
   UPDATE
========================================================= */
export const updateRouletteDrink = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const existing = await RouletteDrink.findById(id);
    if (!existing) return notFound(res, "Trago no encontrado");

    const ALLOWED = ["name", "weight", "active", "color", "category", "price", "product"];
    const updates = {};

    for (const key of ALLOWED) {
      if (req.body[key] === undefined) continue;

      if (key === "weight") {
        const parsed = parseWeight(req.body.weight);
        if (!parsed) return badRequest(res, "weight debe ser un número positivo");
        updates.weight = parsed;
      } else if (key === "active") {
        updates.active = Boolean(req.body.active);
      } else if (key === "product") {
        if (req.body.product === null || req.body.product === "") {
          updates.product = null;
          continue;
        }
        if (!isValidId(req.body.product)) return badRequest(res, "product inválido");
        const productDoc = await Product.findById(req.body.product).lean();
        if (!productDoc) return badRequest(res, "Producto no encontrado");
        if (productDoc.type !== "drink") {
          return badRequest(res, "Solo productos tipo drink pueden estar en roulette");
        }
        updates.product = productDoc._id;
      } else {
        updates[key] = req.body[key];
      }
    }

    const drink = await RouletteDrink.findByIdAndUpdate(id, updates, {
      new: true, runValidators: true,
    });

    /* Logs inteligentes */
    if (updates.weight !== undefined && updates.weight !== existing.weight) {
      await createLog({
        type: "update",
        message: `Peso de "${existing.name}": ${existing.weight} → ${updates.weight}`,
        drinkId: id,
        performedBy: req.user?.id || null,
        meta: { from: existing.weight, to: updates.weight },
      });
    }
    if (updates.active !== undefined && updates.active !== existing.active) {
      await createLog({
        type: "toggle",
        message: `"${existing.name}" ${updates.active ? "activado" : "desactivado"}`,
        drinkId: id,
        performedBy: req.user?.id || null,
      });
    }
    if (updates.product !== undefined && String(updates.product) !== String(existing.product || "")) {
      await createLog({
        type: "update",
        message: `Producto relacionado de "${existing.name}" actualizado`,
        drinkId: id,
        performedBy: req.user?.id || null,
      });
    }

    return ok(res, drink, "Trago actualizado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   DELETE (soft)
========================================================= */
export const deleteRouletteDrink = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const drink = await RouletteDrink.findByIdAndUpdate(
      id, { deleted: true, active: false }, { new: true }
    );
    if (!drink) return notFound(res, "Trago no encontrado");

    await createLog({
      type: "delete",
      message: `"${drink.name}" eliminado de la ruleta`,
      drinkId: id,
      performedBy: req.user?.id || null,
    });
    logger.info(`[Roulette] Eliminado: ${drink.name}`);

    return ok(res, null, `"${drink.name}" eliminado de la ruleta`);
  } catch (error) { next(error); }
};

/* =========================================================
   SPIN ROULETTE (algoritmo ponderado)
========================================================= */
export const spinRoulette = async (req, res, next) => {
  try {
    const drinks = await RouletteDrink.find({ active: true, deleted: false })
      .select("name weight color price category")
      .lean();

    if (!drinks.length) return badRequest(res, "No hay tragos activos en la ruleta");

    const normalized  = drinks.map((d) => ({ ...d, weight: parseWeight(d.weight) || 1 }));
    const totalWeight = normalized.reduce((sum, d) => sum + d.weight, 0);

    if (!totalWeight) return badRequest(res, "Todos los pesos son inválidos");

    /* Algoritmo de selección ponderada */
    const random = Math.random() * totalWeight;
    let acc = 0, selected = normalized[0];

    for (const d of normalized) {
      acc += d.weight;
      if (random <= acc) { selected = d; break; }
    }

    /* Stats async — no bloquear respuesta */
    RouletteDrink.updateOne(
      { _id: selected._id },
      { $inc: { totalSpins: 1 }, lastSelectedAt: new Date() }
    ).exec();

    await createLog({
      type:    "spin",
      message: `Resultado de ruleta: "${selected.name}"`,
      drinkId: selected._id,
      performedBy: req.user?.id || null,
    });

    logger.info(`[Roulette] Resultado: ${selected.name}`);
    return ok(res, {
      result: selected,
      meta:   { totalOptions: normalized.length, totalWeight },
    });
  } catch (error) { next(error); }
};