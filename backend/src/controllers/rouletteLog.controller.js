import RouletteLog from "../models/RouletteLog.js";
import { logger }  from "../config/logger.js";
import { ok }      from "../utils/response.js";

export const createLog = async ({
  type,
  message,
  drinkId = null,
  performedBy = null,
  userId = null,
  sessionId = null,
  deviceInfo = null,
  resultDetails = null,
  location = "system",
  meta = {},
}) => {
  try {
    await RouletteLog.create({ 
      type, 
      message, 
      drinkId, 
      performedBy,
      userId,
      sessionId,
      deviceInfo,
      resultDetails,
      location,
      meta 
    });
  } catch (err) {
    logger.warn(`[RouletteLog] Error al guardar log: ${err.message}`);
  }
};

export const getRouletteLogs = async (req, res, next) => {
  try {
    const { type, limit = 50 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const logs = await RouletteLog.find(filter)
      .populate("drinkId", "name category")
      .populate("performedBy", "name role")
      .populate("userId", "name role")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    return ok(res, logs);
  } catch (error) { next(error); }
};

export const getRouletteAnalytics = async (req, res, next) => {
  try {
    const { userId, startDate, endDate, location, type } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (location) filter.location = location;
    if (type) filter.type = type;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await RouletteLog.find(filter)
      .populate("drinkId", "name category rarity")
      .populate("userId", "name email")
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    // Analytics calculations
    const totalLogs = logs.length;
    const logsByType = logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {});

    const logsByLocation = logs.reduce((acc, log) => {
      acc[log.location] = (acc[log.location] || 0) + 1;
      return acc;
    }, {});

    const spins = logs.filter(log => log.type === "spin");
    const totalSpins = spins.length;
    
    // Rarity distribution from resultDetails
    const rarityDistribution = spins.reduce((acc, log) => {
      const rarity = log.resultDetails?.rarity || "UNKNOWN";
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {});

    // Pity system stats
    const pityTriggered = spins.filter(log => log.resultDetails?.pityTriggered).length;
    const pityRate = totalSpins > 0 ? ((pityTriggered / totalSpins) * 100).toFixed(1) : "0";

    // Top drinks
    const drinkStats = spins.reduce((acc, log) => {
      if (log.drinkId) {
        const drinkName = log.drinkId.name;
        acc[drinkName] = (acc[drinkName] || 0) + 1;
      }
      return acc;
    }, {});

    const topDrinks = Object.entries(drinkStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return ok(res, {
      summary: {
        totalLogs,
        totalSpins,
        pityTriggered,
        pityRate: parseFloat(pityRate),
      },
      distribution: {
        byType: logsByType,
        byLocation: logsByLocation,
        byRarity: rarityDistribution,
      },
      topDrinks,
      recentActivity: logs.slice(0, 20),
    });
  } catch (error) { next(error); }
};