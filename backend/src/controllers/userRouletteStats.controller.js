import UserRouletteStats from "../models/UserRouletteStats.js";
import User from "../models/User.js";
import { getRouletteConfig, saveRouletteConfig } from "../utils/rouletteConfig.js";
import { ok, badRequest, notFound } from "../utils/response.js";
import { io } from "../server.js";

/* =========================================================
   GET ALL EMPLOYEES ROULETTE STATS (Pity Tracker Dashboard)
   ========================================================= */
export const getAllUserRouletteStats = async (req, res, next) => {
  try {
    // 1. Fetch all active employees
    const employees = await User.find({
      isEmployee: true,
      isActive: true,
      deletedAt: null,
    })
      .select("name email role shift performance compliance")
      .lean();

    // 2. Fetch all existing roulette stats
    const statsList = await UserRouletteStats.find({}).lean();
    const statsMap = new Map(statsList.map((s) => [s.user.toString(), s]));

    // 3. Combine user details with stats, filling default values if not exists
    const config = getRouletteConfig();
    const result = employees.map((emp) => {
      const stats = statsMap.get(emp._id.toString()) || {
        totalSpins: 0,
        spinsSinceCommon: 0,
        spinsSinceRare: 0,
        spinsSinceEpic: 0,
        spinsSinceLegendary: 0,
        prizesWon: { common: 0, rare: 0, epic: 0, legendary: 0 },
        pityActive: false,
        pityTargetRarity: null,
      };

      // Calculate employee KPI score for luck buff displaying
      const averageRating = emp.performance?.averageRating || 0;
      const ratingScore = averageRating * 20;
      const complianceScore = emp.compliance?.overallScore || 100;
      const kpiScore = ratingScore > 0 ? (ratingScore * 0.6 + complianceScore * 0.4) : complianceScore;

      // Has luck buff?
      const hasLuckBuff = kpiScore >= config.kpiMinScore;
      const luckMultiplier = hasLuckBuff 
        ? 1.0 + Math.min((kpiScore - config.kpiMinScore) / 100, config.kpiMaxMultiplier - 1)
        : 1.0;

      return {
        user: {
          id: emp._id,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          shift: emp.shift,
          kpiScore: +kpiScore.toFixed(1),
          hasLuckBuff,
          luckMultiplier: +luckMultiplier.toFixed(2),
        },
        stats: {
          ...stats,
          nextRarePity: Math.max(0, config.pityThresholds.RARE - stats.spinsSinceRare),
          nextEpicPity: Math.max(0, config.pityThresholds.EPIC - stats.spinsSinceEpic),
          nextLegendaryPity: Math.max(0, config.pityThresholds.LEGENDARY - stats.spinsSinceLegendary),
        },
      };
    });

    return ok(res, result);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   GET MY ROULETTE STATS
   ========================================================= */
export const getMyRouletteStats = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return badRequest(res, "Usuario no autenticado");
    }

    let stats = await UserRouletteStats.findOne({ user: userId });
    if (!stats) {
      stats = await UserRouletteStats.create({ user: userId });
    }

    const user = await User.findById(userId).select("performance compliance").lean();
    const config = getRouletteConfig();

    let kpiScore = 100;
    if (user) {
      const averageRating = user.performance?.averageRating || 0;
      const ratingScore = averageRating * 20;
      const complianceScore = user.compliance?.overallScore || 100;
      kpiScore = ratingScore > 0 ? (ratingScore * 0.6 + complianceScore * 0.4) : complianceScore;
    }

    const hasLuckBuff = kpiScore >= config.kpiMinScore;
    const luckMultiplier = hasLuckBuff 
      ? 1.0 + Math.min((kpiScore - config.kpiMinScore) / 100, config.kpiMaxMultiplier - 1)
      : 1.0;

    const data = {
      ...stats.toObject(),
      kpiScore: +kpiScore.toFixed(1),
      hasLuckBuff,
      luckMultiplier: +luckMultiplier.toFixed(2),
      config: {
        pityThresholds: config.pityThresholds,
        pityBoostMultiplier: config.pityBoostMultiplier,
      },
      nextRarePity: Math.max(0, config.pityThresholds.RARE - stats.spinsSinceRare),
      nextEpicPity: Math.max(0, config.pityThresholds.EPIC - stats.spinsSinceEpic),
      nextLegendaryPity: Math.max(0, config.pityThresholds.LEGENDARY - stats.spinsSinceLegendary),
    };

    return ok(res, data);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   GET ROULETTE CONFIG (Pity rules config)
   ========================================================= */
export const getRouletteConfigEndpoint = async (req, res, next) => {
  try {
    const config = getRouletteConfig();
    return ok(res, config);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   UPDATE ROULETTE CONFIG
   ========================================================= */
export const updateRouletteConfigEndpoint = async (req, res, next) => {
  try {
    const newConfig = req.body;

    // Validate inputs
    if (!newConfig.pityThresholds || typeof newConfig.pityThresholds !== "object") {
      return badRequest(res, "Se requieren los umbrales de Pity (pityThresholds)");
    }
    const { RARE, EPIC, LEGENDARY } = newConfig.pityThresholds;
    if (typeof RARE !== "number" || typeof EPIC !== "number" || typeof LEGENDARY !== "number") {
      return badRequest(res, "Los umbrales de Pity deben ser números");
    }

    if (typeof newConfig.pityBoostMultiplier !== "number" || newConfig.pityBoostMultiplier <= 0) {
      return badRequest(res, "El multiplicador de Pity debe ser un número positivo");
    }

    // Save
    const saved = saveRouletteConfig(newConfig);
    if (!saved) {
      return badRequest(res, "Error al guardar la configuración");
    }

    // Emit config update event so all connected clients sync
    io.emit("roulette:config:update", newConfig);

    return ok(res, newConfig, "Configuración de ruleta actualizada con éxito");
  } catch (error) {
    throw error;
  }
};
