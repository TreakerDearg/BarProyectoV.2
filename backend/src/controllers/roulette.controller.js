import mongoose      from "mongoose";
import RouletteDrink from "../models/RouletteDrink.js";
import Product       from "../models/Product.js";
import Recipe        from "../models/Recipe.js";
import User          from "../models/User.js";
import UserRouletteStats from "../models/UserRouletteStats.js";
import { createLog } from "./rouletteLog.controller.js";
import { logger }    from "../config/logger.js";
import {
  ok, created, badRequest, notFound,
} from "../utils/response.js";
import { io } from "../server.js";
import { getRouletteConfig } from "../utils/rouletteConfig.js";

const isValidId   = (id)    => mongoose.Types.ObjectId.isValid(id);
const parseWeight = (value) => { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; };

/* =========================================================
   POPULATE HELPERS
   ========================================================= */
const PRODUCT_SELECT = "name type available isActiveForPOS stock image price description dynamicPrice recipeId";

/**
 * Enriches an array of lean RouletteDrink docs with the linked recipe's
 * ingredient list (only name + quantity + unit) so the client / desktop
 * can display a quick recipe preview without an extra round-trip.
 */
async function attachRecipes(drinks) {
  // Collect product IDs that have a recipeId
  const recipeIds = [];
  const productIdToRecipeId = new Map();

  for (const d of drinks) {
    if (d.product?.recipeId) {
      recipeIds.push(d.product.recipeId);
      productIdToRecipeId.set(d.product._id.toString(), d.product.recipeId.toString());
    }
  }

  if (!recipeIds.length) return drinks;

  const recipes = await Recipe.find({ _id: { $in: recipeIds } })
    .populate("ingredients.inventoryItem", "name unit")
    .select("_id product method steps drinkStyle ingredients totalCost")
    .lean();

  const recipeMap = new Map(recipes.map((r) => [r._id.toString(), r]));

  return drinks.map((d) => {
    if (!d.product?.recipeId) return d;
    const recipe = recipeMap.get(d.product.recipeId.toString());
    if (!recipe) return d;
    return {
      ...d,
      recipe: {
        _id:        recipe._id,
        method:     recipe.method,
        drinkStyle: recipe.drinkStyle,
        totalCost:  recipe.totalCost,
        steps:      recipe.steps,
        ingredients: recipe.ingredients.map((ing) => ({
          name:     ing.inventoryItem?.name ?? "?",
          quantity: ing.quantity,
          unit:     ing.unit,
        })),
      },
    };
  });
}

/* =========================================================
   KPI SCORE HELPER
   ========================================================= */
async function getUserKpiScore(userId) {
  if (!userId) return 100;
  const user = await User.findById(userId).select("performance compliance").lean();
  if (!user) return 100;
  const avgRating    = user.performance?.averageRating || 0;
  const ratingScore  = avgRating * 20;
  const compliance   = user.compliance?.overallScore || 100;
  return ratingScore > 0 ? ratingScore * 0.6 + compliance * 0.4 : compliance;
}

/* =========================================================
   WEIGHT CALCULATION (shared logic)
   ========================================================= */
function calcWeight(d, { rarityModifiers, kpiMinScore, kpiMaxMultiplier }, kpiScore, pityOverride) {
  const base      = parseWeight(d.weight) || 1;
  const rarityMod = rarityModifiers[d.rarity] ?? 1.0;

  // Stock-adaptive scaling
  let stockMult = 1.0;
  if (d.product && typeof d.product.stock === "number") {
    const s = d.product.stock;
    if      (s <= 0)  stockMult = 0.0;
    else if (s < 5)   stockMult = Math.pow(s / 5, 1.5);
    else if (s > 15)  stockMult = 1.0 + Math.min((s - 15) * 0.03, 0.5);
  }

  // KPI luck buff
  let luckMult = 1.0;
  if (kpiScore > kpiMinScore && (d.rarity === "EPIC" || d.rarity === "LEGENDARY")) {
    luckMult = 1.0 + Math.min((kpiScore - kpiMinScore) / 100, kpiMaxMultiplier - 1);
  }

  let w = base * rarityMod * stockMult * luckMult;

  // Pity boost
  if (pityOverride && d.rarity === pityOverride) {
    w *= getRouletteConfig().pityBoostMultiplier;
  }

  return { base, stockMult, luckMult, weight: w };
}

/* =========================================================
   GET ALL (admin) / PUBLIC (active only)
   ========================================================= */
export const getPublicRouletteDrinks = (req, res, next) => {
  req.query.activeOnly = "true";
  return getRouletteDrinks(req, res, next);
};

export const getRouletteDrinks = async (req, res, next) => {
  try {
    const { activeOnly, withRecipes } = req.query;
    const filter = activeOnly === "true" ? { active: true, deleted: false } : {};

    const drinks = await RouletteDrink.find(filter)
      .populate("product", PRODUCT_SELECT)
      .select("-__v")
      .lean();

    const kpiScore = await getUserKpiScore(req.user?.id);
    const config   = getRouletteConfig();
    const { rarityModifiers, kpiMinScore, kpiMaxMultiplier } = config;

    const sanitized = drinks.map((d) => {
      const { base, stockMult, luckMult, weight } = calcWeight(
        d, { rarityModifiers, kpiMinScore, kpiMaxMultiplier }, kpiScore, null
      );
      return { ...d, baseWeight: base, stockMultiplier: stockMult, luckMultiplier: luckMult, weight };
    });

    const totalWeight = sanitized.reduce((s, d) => s + d.weight, 0);
    let result = sanitized.map((d) => ({
      ...d,
      probability: totalWeight ? +((d.weight / totalWeight) * 100).toFixed(2) : 0,
    }));

    // Attach recipes when explicitly requested (admin/desktop) or always for public
    if (withRecipes === "true" || activeOnly === "true") {
      result = await attachRecipes(result);
    }

    return ok(res, result);
  } catch (error) { throw error; }
};

/* =========================================================
   CREATE
   ========================================================= */
export const createRouletteDrink = async (req, res, next) => {
  try {
    const { name, weight, color, category, price, product, rarity, pityThreshold } = req.body;

    const existing = await RouletteDrink.collection.findOne({ name: name.toLowerCase() });
    if (existing) {
      if (existing.deleted) {
        const drink = await RouletteDrink.findByIdAndUpdate(
          existing._id,
          { $set: { weight, color, category, price, product, rarity, pityThreshold, deleted: false, active: true } },
          { new: true }
        ).populate("product", PRODUCT_SELECT);
        await createLog({ type: "create", message: `Restaurado: "${drink.name}"`, drinkId: drink._id, performedBy: req.user?.id, location: "desktop" });
        io.to("role:admin").emit("roulette:update", [drink]);
        return created(res, drink);
      }
      return res.status(409).json({ error: "Ya existe un trago con ese nombre en la ruleta." });
    }

    const drink = await RouletteDrink.create({ name, weight, color, category, price, product, rarity, pityThreshold });
    const populated = await RouletteDrink.findById(drink._id).populate("product", PRODUCT_SELECT).lean();
    await createLog({ type: "create", message: `Creado: "${drink.name}"`, drinkId: drink._id, performedBy: req.user?.id, location: "desktop" });
    io.to("role:admin").emit("roulette:update", [populated]);
    return created(res, populated);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Ya existe un trago con ese nombre o producto vinculado." });
    throw error;
  }
};

/* =========================================================
   UPDATE
   ========================================================= */
export const updateRouletteDrink = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const drink = await RouletteDrink.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate("product", PRODUCT_SELECT);
    if (!drink) return notFound(res, "Trago no encontrado");

    await createLog({ type: "update", message: `Actualizado: "${drink.name}"`, drinkId: drink._id, performedBy: req.user?.id, location: "desktop" });
    io.to("role:admin").emit("roulette:update", [drink]);
    return ok(res, drink);
  } catch (error) { throw error; }
};

/* =========================================================
   DELETE (soft)
   ========================================================= */
export const deleteRouletteDrink = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const drink = await RouletteDrink.findById(id);
    if (!drink) return notFound(res, "Trago no encontrado");

    // Prevent deleting the last active drink
    if (drink.active) {
      const activeCount = await RouletteDrink.countDocuments({ active: true, deleted: false });
      if (activeCount <= 1) return badRequest(res, "No podés eliminar el último trago activo.");
    }

    await RouletteDrink.findByIdAndUpdate(id, { deleted: true, active: false });
    await createLog({ type: "delete", message: `Eliminado: "${drink.name}"`, drinkId: drink._id, performedBy: req.user?.id, location: "desktop" });
    io.to("role:admin").emit("roulette:deleted", { id });
    return ok(res, { id, deleted: true });
  } catch (error) { throw error; }
};

/* =========================================================
   BATCH UPDATE
   ========================================================= */
export const batchUpdateRouletteDrinks = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || !updates.length) return badRequest(res, "Updates array es requerido");

    const operations = updates.map(({ id, ...data }) => ({
      updateOne: { filter: { _id: id }, update: data },
    }));

    const result = await RouletteDrink.bulkWrite(operations);

    await createLog({
      type: "update",
      message: `Batch update: ${updates.length} tragos modificados`,
      performedBy: req.user?.id,
      location: "desktop",
      meta: { count: updates.length, modifiedCount: result.modifiedCount },
    });

    // Broadcast refreshed list
    const refreshed = await RouletteDrink.find({ deleted: false })
      .populate("product", PRODUCT_SELECT)
      .lean();
    io.to("role:admin").emit("roulette:update", refreshed);

    return ok(res, { success: true, modifiedCount: result.modifiedCount, matchedCount: result.matchedCount });
  } catch (error) { throw error; }
};

/* =========================================================
   SPIN — Advanced pity + KPI + stock algorithm
   ========================================================= */
export const spinRoulette = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    // 1. Active drinks with product stock
    const drinks = await RouletteDrink.find({ active: true, deleted: false })
      .populate("product", "stock name")
      .lean();

    if (!drinks.length) return badRequest(res, "No hay tragos activos en la ruleta");

    // 2. Filter out drinks with explicitly 0 stock
    const available = drinks.filter((d) => {
      if (!d.product) return true;
      if (d.product.stock === undefined || d.product.stock === null) return true;
      return d.product.stock > 0;
    });

    if (!available.length) return badRequest(res, "Todos los tragos están agotados");

    // 3. Config + KPI
    const config   = getRouletteConfig();
    const { pityThresholds, rarityModifiers, kpiMinScore, kpiMaxMultiplier } = config;
    const kpiScore = await getUserKpiScore(userId);

    // 4. Pity system
    let userStats    = null;
    let pityOverride = null;

    if (userId) {
      userStats = await UserRouletteStats.findOne({ user: userId });
      if (!userStats) userStats = await UserRouletteStats.create({ user: userId });

      if      (userStats.spinsSinceLegendary >= pityThresholds.LEGENDARY) pityOverride = "LEGENDARY";
      else if (userStats.spinsSinceEpic      >= pityThresholds.EPIC)      pityOverride = "EPIC";
      else if (userStats.spinsSinceRare      >= pityThresholds.RARE)      pityOverride = "RARE";
    }

    // 5. Weight calculation
    const weighted = available.map((d) => {
      const { base, stockMult, luckMult, weight } = calcWeight(
        d, { rarityModifiers, kpiMinScore, kpiMaxMultiplier }, kpiScore, pityOverride
      );
      return { ...d, baseWeight: base, stockMultiplier: stockMult, luckMultiplier: luckMult, calculatedWeight: weight };
    });

    // 6. Selection (pity-forced or normal)
    let selected;

    if (pityOverride) {
      const pool = weighted.filter((d) => d.rarity === pityOverride);
      if (pool.length) {
        const tw = pool.reduce((s, d) => s + d.calculatedWeight, 0);
        let r = Math.random() * tw, acc = 0;
        for (const d of pool) { acc += d.calculatedWeight; if (r <= acc) { selected = d; break; } }
      }
    }

    if (!selected) {
      const tw = weighted.reduce((s, d) => s + d.calculatedWeight, 0);
      let r = Math.random() * tw, acc = 0;
      selected = weighted[0];
      for (const d of weighted) { acc += d.calculatedWeight; if (r <= acc) { selected = d; break; } }
    }

    // 7. Compute final probability for the response
    const totalWeightAll = weighted.reduce((s, d) => s + d.calculatedWeight, 0);
    const probability    = totalWeightAll ? +((selected.calculatedWeight / totalWeightAll) * 100).toFixed(2) : 0;

    // 8. Attach recipe to the selected drink
    const [enriched] = await attachRecipes([{ ...selected, probability }]);

    // 9. Update user stats atomically
    if (userId && userStats) {
      const inc = {
        totalSpins:  1,
        [`spinsSince${selected.rarity}`]:  1,
        [`prizesWon.${selected.rarity.toLowerCase()}`]: 1,
      };

      // Reset counters for won rarity and lower
      const rarityOrder = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
      const wonIdx      = rarityOrder.indexOf(selected.rarity);
      for (let i = 0; i <= wonIdx; i++) {
        inc[`spinsSince${rarityOrder[i]}`] = 1 - (userStats[`spinsSince${rarityOrder[i]}`] + 1);
      }

      const upd = {
        $inc:  inc,
        [`last${selected.rarity}At`]: new Date(),
      };
      if (pityOverride && selected.rarity === pityOverride) {
        upd.$set = { pityActive: false, pityTargetRarity: null };
      }
      await UserRouletteStats.updateOne({ user: userId }, upd);
    }

    // 10. Async stat bump on the drink doc
    RouletteDrink.updateOne(
      { _id: selected._id },
      { $inc: { totalSpins: 1, totalWins: 1 }, lastSelectedAt: new Date() }
    ).exec();

    // 11. Logging
    await createLog({
      type:          "spin",
      message:       `[${selected.rarity}] "${selected.name}"${pityOverride ? ` (PITY: ${pityOverride})` : ""}`,
      drinkId:       selected._id,
      performedBy:   userId || null,
      userId:        userId || null,
      sessionId:     req.sessionID || null,
      deviceInfo:    { userAgent: req.get("user-agent"), ip: req.ip },
      resultDetails: {
        rarity:         selected.rarity,
        weight:         selected.calculatedWeight,
        probability,
        category:       selected.category,
        pityTriggered:  !!pityOverride,
        pityTarget:     pityOverride,
        kpiScore,
        stockMult:      selected.stockMultiplier,
        luckMult:       selected.luckMultiplier,
      },
      location: userId ? "web" : "public",
    });

    // 12. Socket broadcasts
    const payload = {
      result:  enriched,
      meta: {
        totalOptions: available.length,
        totalWeight:  totalWeightAll,
        rarity:       selected.rarity,
        pityTriggered: !!pityOverride,
        kpiScore,
      },
    };

    if (userId) io.to(`user:${userId}`).emit("roulette:result", payload);
    io.emit("roulette:spin", payload);
    io.to("role:admin").emit("roulette:admin:spin", { ...payload, userId });

    return ok(res, payload);
  } catch (error) { throw error; }
};

/* =========================================================
   SIMULATE — Monte Carlo
   ========================================================= */
export const simulateRoulette = async (req, res, next) => {
  try {
    const { iterations = 1000, kpiScore = 100, customWeights } = req.body;

    const N = Math.min(Math.max(Number(iterations), 100), 100_000);

    const drinks = await RouletteDrink.find({ active: true, deleted: false })
      .populate("product", "stock")
      .lean();

    if (!drinks.length) return badRequest(res, "No hay tragos activos");

    const config = getRouletteConfig();

    const weighted = drinks.map((d) => {
      const overriddenWeight = customWeights?.[d._id.toString()];
      const base  = overriddenWeight ?? d.weight;
      const { weight } = calcWeight(
        { ...d, weight: base },
        config, kpiScore, null
      );
      return { ...d, calculatedWeight: weight };
    });

    const total = weighted.reduce((s, d) => s + d.calculatedWeight, 0);
    const wins  = new Map(weighted.map((d) => [d._id.toString(), 0]));

    for (let i = 0; i < N; i++) {
      let r = Math.random() * total, acc = 0;
      for (const d of weighted) {
        acc += d.calculatedWeight;
        if (r <= acc) { wins.set(d._id.toString(), (wins.get(d._id.toString()) || 0) + 1); break; }
      }
    }

    const items = weighted.map((d) => {
      const w = wins.get(d._id.toString()) || 0;
      const theo = total ? (d.calculatedWeight / total) * 100 : 0;
      const sim  = (w / N) * 100;
      return {
        _id:                   d._id,
        name:                  d.name,
        rarity:                d.rarity,
        category:              d.category,
        color:                 d.color,
        baseWeight:            d.weight,
        stockMultiplier:       d.stockMultiplier ?? 1,
        luckMultiplier:        d.luckMultiplier  ?? 1,
        calculatedWeight:      d.calculatedWeight,
        theoreticalProbability: +theo.toFixed(2),
        simulatedWins:         w,
        simulatedProbability:  +sim.toFixed(2),
        deviation:             +(Math.abs(theo - sim)).toFixed(2),
      };
    });

    // Rarity aggregates
    const rarities = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
    const rarityStats = {};
    for (const r of rarities) {
      const group = items.filter((i) => i.rarity === r);
      const theo  = group.reduce((s, i) => s + i.theoreticalProbability, 0);
      const sim   = group.reduce((s, i) => s + i.simulatedProbability,   0);
      const w     = group.reduce((s, i) => s + i.simulatedWins,          0);
      rarityStats[r] = { theoretical: +theo.toFixed(2), simulated: +sim.toFixed(2), wins: w, deviation: +(Math.abs(theo - sim)).toFixed(2) };
    }

    const avgDev    = items.reduce((s, i) => s + i.deviation, 0) / (items.length || 1);
    const chiSquare = items.reduce((d, i) => {
      const expected = (i.theoreticalProbability / 100) * N;
      return expected > 0 ? d + Math.pow(i.simulatedWins - expected, 2) / expected : d;
    }, 0);

    const isStable = N >= 10_000
      ? chiSquare < items.length + 10
      : avgDev < 2.0;

    const kpiScore_n = +kpiScore;
    return ok(res, {
      iterations: N,
      kpiScoreSimulated: kpiScore_n,
      items,
      rarityStats,
      audit: {
        averageDeviation: +avgDev.toFixed(3),
        chiSquare: +chiSquare.toFixed(2),
        isStatisticallyStable: isStable,
        recommendation: isStable
          ? "La distribución es estadísticamente estable."
          : "Ajustar pesos: la desviación es alta. Considera usar Auto-Balance.",
      },
    });
  } catch (error) { throw error; }
};

/* =========================================================
   GET RECIPE FOR A ROULETTE DRINK
   ========================================================= */
export const getRoulettedrinkRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const rd = await RouletteDrink.findById(id).populate("product", "recipeId name image").lean();
    if (!rd) return notFound(res, "Trago no encontrado");

    if (!rd.product?.recipeId) return ok(res, null);

    const recipe = await Recipe.findById(rd.product.recipeId)
      .populate("ingredients.inventoryItem", "name unit")
      .populate("specifications.glassware", "name")
      .populate("specifications.ice", "name")
      .lean();

    if (!recipe) return ok(res, null);

    return ok(res, {
      ...recipe,
      product: { _id: rd.product._id, name: rd.product.name, image: rd.product.image },
    });
  } catch (error) { throw error; }
};
