import Roulette from "../models/Roulette.js";

//  GET CONFIG
export const getRoulette = async (req, res) => {
  const items = await Roulette.find().populate("productId");
  res.json(items);
};

//  SAVE CONFIG (REEMPLAZA TODO)
export const saveRoulette = async (req, res) => {
  try {
    const { items } = req.body;

    await Roulette.deleteMany();

    const created = await Roulette.insertMany(items);

    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};