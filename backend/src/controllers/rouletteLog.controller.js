import RouletteLog from "../models/RouletteLog.js";

/* =========================
   CREATE LOG (helper interno)
========================= */
export const createLog = async ({
  type,
  message,
  drinkId = null,
  meta = {},
}) => {
  try {
    await RouletteLog.create({
      type,
      message,
      drinkId,
      meta,
    });
  } catch (err) {
    console.error("LOG ERROR:", err.message);
  }
};

/* =========================
   GET LOGS
========================= */
export const getRouletteLogs = async (req, res) => {
  try {
    const logs = await RouletteLog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(logs);
  } catch (err) {
    res.status(500).json({
      error: "Error obteniendo logs",
    });
  }
};