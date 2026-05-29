import mongoose      from "mongoose";
import RouletteDrink from "../models/RouletteDrink.js";
import Product       from "../models/Product.js";
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
      .populate("product", "name type available isActiveForPOS stock")
      .select("-__v")
      .lean();

    // Fetch user if logged in to apply KPI luck buff to the list
    let kpiScore = 100;
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("performance compliance").lean();
      if (user) {
        const averageRating = user.performance?.averageRating || 0;
        const ratingScore = averageRating * 20;
        const complianceScore = user.compliance?.overallScore || 100;
        kpiScore = ratingScore > 0 ? (ratingScore * 0.6 + complianceScore * 0.4) : complianceScore;
      }
    }

    const config = getRouletteConfig();
    const { rarityModifiers, kpiMinScore, kpiMaxMultiplier } = config;

    const sanitized = drinks.map((d) => {
      const baseWeight = parseWeight(d.weight) || 1;
      
      // 1. Stock-Adaptive Scaling
      let stockMultiplier = 1.0;
      if (d.product && typeof d.product.stock === "number") {
        const stock = d.product.stock;
        if (stock <= 0) {
          stockMultiplier = 0.0;
        } else if (stock < 5) {
          stockMultiplier = Math.pow(stock / 5, 1.5);
        } else if (stock > 15) {
          stockMultiplier = 1.0 + Math.min((stock - 15) * 0.03, 0.5);
        }
      }

      // 2. KPI Luck Buffs
      let luckMultiplier = 1.0;
      if (kpiScore > kpiMinScore && (d.rarity === "EPIC" || d.rarity === "LEGENDARY")) {
        luckMultiplier = 1.0 + Math.min((kpiScore - kpiMinScore) / 100, kpiMaxMultiplier - 1);
      }

      const rarityMod = rarityModifiers[d.rarity] || 1.0;
      const calculatedWeight = baseWeight * rarityMod * stockMultiplier * luckMultiplier;

      return {
        ...d,
        baseWeight,
        stockMultiplier,
        luckMultiplier,
        weight: calculatedWeight
      };
    });

    const totalWeight  = sanitized.reduce((sum, d) => sum + d.weight, 0);
    const result       = sanitized.map((d) => ({
      ...d,
      probability: totalWeight ? +((d.weight / totalWeight) * 100).toFixed(2) : 0,
    }));

    return ok(res, result);
  } catch (error) { throw error; }
};

/* =========================================================
   CREATE / UPDATE (Simplified for brevity in this step)
========================================================= */
export const createRouletteDrink = async (req, res, next) => {
  try {
    const { name, weight, color, category, price, product, rarity, pityThreshold } = req.body;
    
    // Check if exists even if deleted to bypass 11000 conflict
    const existing = await RouletteDrink.collection.findOne({ name: name.toLowerCase() });
    if (existing) {
      if (existing.deleted) {
        const drink = await RouletteDrink.findByIdAndUpdate(existing._id, {
          $set: { weight, color, category, price, product, rarity, pityThreshold, deleted: false, active: true }
        }, { new: true });
        return created(res, drink);
      } else {
        return res.status(409).json({ message: "Ya existe un trago con ese nombre en la ruleta." });
      }
    }

    const drink = await RouletteDrink.create({
      name, weight, color, category, price, product, rarity, pityThreshold
    });
    return created(res, drink);
  } catch (error) { 
    if (error.code === 11000) return res.status(409).json({ message: "Ya existe un trago con ese nombre o producto vinculado." });
    throw error; 
  }
};

export const updateRouletteDrink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const drink = await RouletteDrink.findByIdAndUpdate(id, req.body, { new: true });
    return ok(res, drink);
  } catch (error) { throw error; }
};

export const deleteRouletteDrink = async (req, res, next) => {
  try {
    await RouletteDrink.findByIdAndUpdate(req.params.id, { deleted: true });
    return ok(res, null);
  } catch (error) { throw error; }
};

/* =========================================================
   BATCH UPDATE (Optimization for auto-balance)
========================================================= */
export const batchUpdateRouletteDrinks = async (req, res, next) => {
  try {
    const { updates } = req.body; // Array of { id, updates }

    if (!Array.isArray(updates) || updates.length === 0) {
      return badRequest(res, "Updates array is required");
    }

    const operations = updates.map(({ id, ...updateData }) => ({
      updateOne: {
        filter: { _id: id },
        update: updateData,
      },
    }));

    const result = await RouletteDrink.bulkWrite(operations);

    // Log the batch update
    await createLog({
      type: "update",
      message: `Batch update: ${updates.length} drinks modified`,
      performedBy: req.user?.id || null,
      userId: req.user?.id || null,
      location: req.headers["x-location"] || "api",
      meta: { count: updates.length, modifiedCount: result.modifiedCount },
    });

    return ok(res, {
      success: true,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    });
  } catch (error) { throw error; }
};

/* =========================================================
   SPIN ROULETTE (Advanced Pondered Algorithm with Pity System)
========================================================= */
export const spinRoulette = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    // 1. Get active drinks and populate product stock
    const drinks = await RouletteDrink.find({ active: true, deleted: false })
      .populate("product", "stock")
      .lean();

    if (!drinks.length) return badRequest(res, "No hay tragos activos");

    // 2. Filter by stock (Operational Intelligence)
    const availableDrinks = drinks.filter(d => {
      if (!d.product) return true; // Si no tiene producto vinculado, siempre disponible
      if (d.product.stock === undefined || d.product.stock === null) return true; // Si no maneja stock
      return d.product.stock > 0;
    });

    if (!availableDrinks.length) return badRequest(res, "Todos los tragos de la ruleta están agotados");

    // Load config
    const config = getRouletteConfig();
    const { pityThresholds, pityBoostMultiplier, rarityModifiers, kpiMinScore, kpiMaxMultiplier } = config;

    // 3. Get or create user stats for pity system
    let userStats = null;
    let pityOverride = null;

    if (userId) {
      userStats = await UserRouletteStats.findOne({ user: userId });

      if (!userStats) {
        userStats = await UserRouletteStats.create({ user: userId });
      }

      // Check if pity should trigger
      if (userStats.spinsSinceLegendary >= pityThresholds.LEGENDARY) {
        pityOverride = "LEGENDARY";
      } else if (userStats.spinsSinceEpic >= pityThresholds.EPIC) {
        pityOverride = "EPIC";
      } else if (userStats.spinsSinceRare >= pityThresholds.RARE) {
        pityOverride = "RARE";
      }
    }

    // Get user KPI Luck score
    let kpiScore = 100;
    if (userId) {
      const user = await User.findById(userId).select("performance compliance").lean();
      if (user) {
        const averageRating = user.performance?.averageRating || 0;
        const ratingScore = averageRating * 20;
        const complianceScore = user.compliance?.overallScore || 100;
        kpiScore = ratingScore > 0 ? (ratingScore * 0.6 + complianceScore * 0.4) : complianceScore;
      }
    }

    // 4. Apply weights and Rarity modifiers
    const weightedList = availableDrinks.map(d => {
      const baseWeight = parseWeight(d.weight) || 1;
      const rarityMod = rarityModifiers[d.rarity] || 1.0;
      
      // Stock-Adaptive Scaling
      let stockMultiplier = 1.0;
      if (d.product && typeof d.product.stock === "number") {
        const stock = d.product.stock;
        if (stock <= 0) {
          stockMultiplier = 0.0;
        } else if (stock < 5) {
          stockMultiplier = Math.pow(stock / 5, 1.5);
        } else if (stock > 15) {
          stockMultiplier = 1.0 + Math.min((stock - 15) * 0.03, 0.5);
        }
      }

      // KPI Luck Buffs
      let luckMultiplier = 1.0;
      if (kpiScore > kpiMinScore && (d.rarity === "EPIC" || d.rarity === "LEGENDARY")) {
        luckMultiplier = 1.0 + Math.min((kpiScore - kpiMinScore) / 100, kpiMaxMultiplier - 1);
      }

      let calculatedWeight = baseWeight * rarityMod * stockMultiplier * luckMultiplier;

      // Pity system: boost weight for target rarity
      if (pityOverride && d.rarity === pityOverride) {
        calculatedWeight *= pityBoostMultiplier; // dynamic boost multiplier
      }

      return {
        ...d,
        stockMultiplier,
        luckMultiplier,
        calculatedWeight
      };
    });

    // If pity override is active, force selection from that rarity
    let selected;
    if (pityOverride) {
      const pityOptions = weightedList.filter(d => d.rarity === pityOverride);
      if (pityOptions.length > 0) {
        const pityTotalWeight = pityOptions.reduce((sum, d) => sum + d.calculatedWeight, 0);
        const pityRandom = Math.random() * pityTotalWeight;
        let pityAcc = 0;
        
        for (const d of pityOptions) {
          pityAcc += d.calculatedWeight;
          if (pityRandom <= pityAcc) {
            selected = d;
            break;
          }
        }
      }
    }

    // Normal selection if no pity override or pity failed
    if (!selected) {
      const totalWeight = weightedList.reduce((sum, d) => sum + d.calculatedWeight, 0);
      const random = Math.random() * totalWeight;
      let acc = 0;
      selected = weightedList[0];

      for (const d of weightedList) {
        acc += d.calculatedWeight;
        if (random <= acc) {
          selected = d;
          break;
        }
      }
    }

    // 5. Update user stats
    if (userId && userStats) {
      const updateData = {
        $inc: {
          totalSpins: 1,
          [`spinsSince${selected.rarity}`]: 1,
          [`prizesWon.${selected.rarity.toLowerCase()}`]: 1,
        },
        [`last${selected.rarity}At`]: new Date(),
      };

      // Reset counters for achieved rarity and higher rarities
      if (selected.rarity === "LEGENDARY") {
        updateData.$inc.spinsSinceLegendary = -userStats.spinsSinceLegendary;
        updateData.$inc.spinsSinceEpic = -userStats.spinsSinceEpic;
        updateData.$inc.spinsSinceRare = -userStats.spinsSinceRare;
        updateData.$inc.spinsSinceCommon = -userStats.spinsSinceCommon;
      } else if (selected.rarity === "EPIC") {
        updateData.$inc.spinsSinceEpic = -userStats.spinsSinceEpic;
        updateData.$inc.spinsSinceRare = -userStats.spinsSinceRare;
        updateData.$inc.spinsSinceCommon = -userStats.spinsSinceCommon;
      } else if (selected.rarity === "RARE") {
        updateData.$inc.spinsSinceRare = -userStats.spinsSinceRare;
        updateData.$inc.spinsSinceCommon = -userStats.spinsSinceCommon;
      } else if (selected.rarity === "COMMON") {
        updateData.$inc.spinsSinceCommon = -userStats.spinsSinceCommon;
      }

      // Reset pity if triggered
      if (pityOverride && selected.rarity === pityOverride) {
        updateData.$set = {
          pityActive: false,
          pityTargetRarity: null,
        };
      }

      await UserRouletteStats.updateOne({ user: userId }, updateData);
    }

    // 6. Async updates & logging
    RouletteDrink.updateOne(
      { _id: selected._id },
      { $inc: { totalSpins: 1, totalWins: 1 }, lastSelectedAt: new Date() }
    ).exec();

    await createLog({
      type: "spin",
      message: `[${selected.rarity}] Resultado: "${selected.name}"${pityOverride ? ` (PITY: ${pityOverride})` : ''}`,
      drinkId: selected._id,
      performedBy: userId || null,
      userId: userId || null,
      sessionId: req.sessionID || null,
      deviceInfo: {
        userAgent: req.get("user-agent"),
        ip: req.ip,
      },
      resultDetails: {
        rarity: selected.rarity,
        weight: selected.weight,
        probability: selected.probability,
        category: selected.category,
        pityTriggered: !!pityOverride,
        pityTarget: pityOverride,
      },
      location: req.headers["x-location"] || "api",
      meta: {
        rarity: selected.rarity,
        pityTriggered: !!pityOverride,
        pityTarget: pityOverride,
      }
    });

    // 7. Emit Socket.IO events
    if (userId) {
      io.to(`user:${userId}`).emit("roulette:result", {
        result: selected,
        meta: {
          pityTriggered: !!pityOverride,
          pityTarget: pityOverride,
        },
      });
    }

    // Notify all clients about roulette spin update
    io.emit("roulette:spin", {
      result: selected,
      meta: {
        totalOptions: weightedList.length,
        totalWeight: weightedList.reduce((sum, d) => sum + d.calculatedWeight, 0),
        rarity: selected.rarity,
        pityTriggered: !!pityOverride,
        pityTarget: pityOverride,
      },
    });

    // Notify desktop/admin about activity
    io.to("role:admin").emit("roulette:admin:spin", {
      result: selected,
      userId,
      timestamp: new Date(),
    });

    return ok(res, {
      result: selected,
      meta: {
        totalOptions: weightedList.length,
        totalWeight: weightedList.reduce((sum, d) => sum + d.calculatedWeight, 0),
        rarity: selected.rarity,
        pityTriggered: !!pityOverride,
        pityTarget: pityOverride,
      },
    });
  } catch (error) { throw error; }
};

/* =========================================================
   MONTE CARLO SIMULATION
   ========================================================= */
export const simulateRoulette = async (req, res, next) => {
  try {
    const { iterations = 1000, customWeights } = req.body;
    
    if (typeof iterations !== "number" || iterations <= 0 || iterations > 100000) {
      return badRequest(res, "El número de tiradas a simular debe estar entre 1 y 100,000");
    }

    // 1. Get active drinks and populate product stock
    const drinks = await RouletteDrink.find({ active: true, deleted: false })
      .populate("product", "stock")
      .lean();

    if (!drinks.length) return badRequest(res, "No hay tragos activos");

    // Filter by stock
    const availableDrinks = drinks.filter(d => {
      if (!d.product) return true;
      if (d.product.stock === undefined || d.product.stock === null) return true;
      return d.product.stock > 0;
    });

    if (!availableDrinks.length) return badRequest(res, "Todos los tragos están agotados");

    // 2. Load dynamic config
    const config = getRouletteConfig();
    const { rarityModifiers, kpiMinScore, kpiMaxMultiplier } = config;

    // Apply weights using standard or custom KPI score
    const simulateKpiScore = req.body.kpiScore || 100;
    
    const weightedList = availableDrinks.map(d => {
      let baseWeight = parseWeight(d.weight) || 1;
      if (customWeights && typeof customWeights[d._id.toString()] === "number") {
        baseWeight = customWeights[d._id.toString()];
      }
      
      const rarityMod = rarityModifiers[d.rarity] || 1.0;
      
      // Stock-Adaptive Scaling
      let stockMultiplier = 1.0;
      if (d.product && typeof d.product.stock === "number") {
        const stock = d.product.stock;
        if (stock <= 0) {
          stockMultiplier = 0.0;
        } else if (stock < 5) {
          stockMultiplier = Math.pow(stock / 5, 1.5);
        } else if (stock > 15) {
          stockMultiplier = 1.0 + Math.min((stock - 15) * 0.03, 0.5);
        }
      }

      // KPI Luck Buffs
      let luckMultiplier = 1.0;
      if (simulateKpiScore > kpiMinScore && (d.rarity === "EPIC" || d.rarity === "LEGENDARY")) {
        luckMultiplier = 1.0 + Math.min((simulateKpiScore - kpiMinScore) / 100, kpiMaxMultiplier - 1);
      }

      const calculatedWeight = baseWeight * rarityMod * stockMultiplier * luckMultiplier;

      return {
        ...d,
        baseWeight,
        stockMultiplier,
        luckMultiplier,
        calculatedWeight
      };
    });

    const totalWeight = weightedList.reduce((sum, d) => sum + d.calculatedWeight, 0);
    if (totalWeight <= 0) {
      return badRequest(res, "El peso total de los tragos disponibles debe ser mayor a 0");
    }

    // 3. Monte Carlo Simulation
    const results = {};
    weightedList.forEach(d => {
      results[d._id.toString()] = {
        _id: d._id,
        name: d.name,
        rarity: d.rarity,
        category: d.category,
        color: d.color,
        baseWeight: d.baseWeight,
        stockMultiplier: d.stockMultiplier,
        luckMultiplier: d.luckMultiplier,
        calculatedWeight: d.calculatedWeight,
        theoreticalProbability: +((d.calculatedWeight / totalWeight) * 100).toFixed(2),
        simulatedWins: 0,
      };
    });

    // Run simulation loop in-memory
    for (let i = 0; i < iterations; i++) {
      const random = Math.random() * totalWeight;
      let acc = 0;
      let selectedId = weightedList[0]._id.toString();

      for (const d of weightedList) {
        acc += d.calculatedWeight;
        if (random <= acc) {
          selectedId = d._id.toString();
          break;
        }
      }
      results[selectedId].simulatedWins++;
    }

    // 4. Post-process simulation metrics
    const items = Object.values(results).map(item => {
      const simulatedProbability = +((item.simulatedWins / iterations) * 100).toFixed(2);
      const deviation = +(simulatedProbability - item.theoreticalProbability).toFixed(2);
      return {
        ...item,
        simulatedProbability,
        deviation,
      };
    });

    // Aggregates by rarity
    const rarityStats = {
      COMMON: { theoretical: 0, simulated: 0, wins: 0 },
      RARE: { theoretical: 0, simulated: 0, wins: 0 },
      EPIC: { theoretical: 0, simulated: 0, wins: 0 },
      LEGENDARY: { theoretical: 0, simulated: 0, wins: 0 },
    };

    items.forEach(item => {
      if (rarityStats[item.rarity]) {
        rarityStats[item.rarity].theoretical += item.theoreticalProbability;
        rarityStats[item.rarity].simulated += item.simulatedProbability;
        rarityStats[item.rarity].wins += item.simulatedWins;
      }
    });

    // Format rarity aggregations
    Object.keys(rarityStats).forEach(key => {
      rarityStats[key].theoretical = +(rarityStats[key].theoretical).toFixed(2);
      rarityStats[key].simulated = +(rarityStats[key].simulated).toFixed(2);
      rarityStats[key].deviation = +(rarityStats[key].simulated - rarityStats[key].theoretical).toFixed(2);
    });

    // 5. Audit Deviation Heatmap & Stabilizer Recommendation
    let totalDeviation = 0;
    items.forEach(item => {
      totalDeviation += Math.abs(item.deviation);
    });
    const averageDeviation = +(totalDeviation / items.length).toFixed(2);
    
    let chiSquareSum = 0;
    items.forEach(item => {
      const expected = (item.theoreticalProbability / 100) * iterations;
      const observed = item.simulatedWins;
      if (expected > 0) {
        chiSquareSum += Math.pow(observed - expected, 2) / expected;
      }
    });
    
    const isStatisticallyStable = iterations >= 10000 ? chiSquareSum < (items.length + 10) : averageDeviation < 2.0;

    return ok(res, {
      iterations,
      kpiScoreSimulated: simulateKpiScore,
      items,
      rarityStats,
      audit: {
        averageDeviation,
        chiSquare: +chiSquareSum.toFixed(2),
        isStatisticallyStable,
        recommendation: isStatisticallyStable 
          ? "El motor de ruleta está operando establemente y converge a las probabilidades teóricas."
          : "Se observa una pequeña desviación estadística típica de muestras aleatorias cortas. Para una auditoría perfecta de convergencia, corra 10,000 tiradas."
      }
    });
  } catch (error) { throw error; }
};