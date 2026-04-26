import RouletteLog from "../models/RouletteLog.js";
import { logger }  from "../config/logger.js";
import { ok }      from "../utils/response.js";

export const createLog = async ({
  type,
  message,
  drinkId = null,
  performedBy = null,
  meta = {},
}) => {
  try {
    await RouletteLog.create({ type, message, drinkId, performedBy, meta });
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
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    return ok(res, logs);
  } catch (error) { next(error); }
};