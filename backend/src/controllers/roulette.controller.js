// controllers/roulette.controller.js

import mongoose from "mongoose";
import RouletteDrink from "../models/RouletteDrink.js";
import { createLog } from "./rouletteLog.controller.js";

/* =========================
   HELPERS
========================= */

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const parseWeight = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

/* =========================
   GET ALL
========================= */
export const getRouletteDrinks = async (req, res) => {
  try {
    const drinks = await RouletteDrink.find()
      .select("-__v")
      .lean();

    const sanitized = drinks.map((d) => {
      const weight = parseWeight(d.weight) || 1;

      return {
        ...d,
        weight,
      };
    });

    const totalWeight = sanitized.reduce(
      (sum, d) => sum + d.weight,
      0
    );

    const result = sanitized.map((d) => ({
      ...d,
      probability: totalWeight
        ? (d.weight / totalWeight) * 100
        : 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("GET ROULETTE ERROR:", err);
    res.status(500).json({
      error: "Error obteniendo tragos",
    });
  }
};

/* =========================
   CREATE
========================= */
export const createRouletteDrink = async (req, res) => {
  try {
    const { name, weight, color, category, price } =
      req.body;

    const parsedWeight = parseWeight(weight);

    if (!name || !parsedWeight) {
      return res.status(400).json({
        error: "Nombre y peso válidos son obligatorios",
      });
    }

    const drink = await RouletteDrink.create({
      name,
      weight: parsedWeight,
      color,
      category,
      price,
    });

    // LOG
    await createLog({
      type: "create",
      message: `Se agregó "${drink.name}" a la ruleta`,
      drinkId: drink._id,
    });

    res.status(201).json(drink);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: "El trago ya existe",
      });
    }

    console.error("CREATE ERROR:", err);

    res.status(500).json({
      error: "Error creando trago",
    });
  }
};

/* =========================
   UPDATE
========================= */
export const updateRouletteDrink = async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, active, color } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    const existing = await RouletteDrink.findById(id);

    if (!existing) {
      return res.status(404).json({
        error: "Trago no encontrado",
      });
    }

    const updates = {};

    /* ===== WEIGHT ===== */
    if (weight !== undefined) {
      const parsed = parseWeight(weight);

      if (!parsed) {
        return res.status(400).json({
          error: "Peso inválido",
        });
      }

      updates.weight = parsed;
    }

    /* ===== ACTIVE ===== */
    if (active !== undefined) {
      updates.active = Boolean(active);
    }

    /* ===== COLOR ===== */
    if (color !== undefined) {
      updates.color = color;
    }

    const drink = await RouletteDrink.findByIdAndUpdate(
      id,
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    /* =========================
       LOGS INTELIGENTES
    ========================= */

    if (
      updates.weight !== undefined &&
      updates.weight !== existing.weight
    ) {
      await createLog({
        type: "update",
        message: `Peso de "${existing.name}" cambiado de ${existing.weight} → ${updates.weight}`,
        drinkId: id,
        meta: {
          from: existing.weight,
          to: updates.weight,
        },
      });
    }

    if (
      updates.active !== undefined &&
      updates.active !== existing.active
    ) {
      await createLog({
        type: "toggle",
        message: `"${existing.name}" ${
          updates.active ? "activado" : "desactivado"
        }`,
        drinkId: id,
      });
    }

    if (
      updates.color &&
      updates.color !== existing.color
    ) {
      await createLog({
        type: "update",
        message: `Color de "${existing.name}" actualizado`,
        drinkId: id,
      });
    }

    res.json(drink);
  } catch (err) {
    console.error("UPDATE ERROR:", err);

    res.status(500).json({
      error: "Error actualizando",
    });
  }
};

/* =========================
   DELETE (SOFT)
========================= */
export const deleteRouletteDrink = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    const drink = await RouletteDrink.findByIdAndUpdate(
      id,
      { deleted: true, active: false },
      { returnDocument: "after" }
    );

    if (!drink) {
      return res.status(404).json({
        error: "Trago no encontrado",
      });
    }

    // LOG
    await createLog({
      type: "delete",
      message: `"${drink.name}" eliminado de la ruleta`,
      drinkId: id,
    });

    res.json({ message: "Trago eliminado" });
  } catch (err) {
    console.error("DELETE ERROR:", err);

    res.status(500).json({
      error: "Error eliminando",
    });
  }
};

/* =========================
   SPIN ROULETTE (PRO)
========================= */
export const spinRoulette = async (req, res) => {
  try {
    const drinks = await RouletteDrink.find({
      active: true,
      deleted: false,
    })
      .select("name weight color price")
      .lean();

    if (!drinks.length) {
      return res.status(400).json({
        error: "No hay tragos activos",
      });
    }

    const normalized = drinks.map((d) => ({
      ...d,
      weight: parseWeight(d.weight) || 1,
    }));

    const totalWeight = normalized.reduce(
      (sum, d) => sum + d.weight,
      0
    );

    if (!totalWeight) {
      return res.status(400).json({
        error: "Pesos inválidos",
      });
    }

    const random = Math.random() * totalWeight;

    let acc = 0;
    let selected = normalized[0];

    for (const d of normalized) {
      acc += d.weight;
      if (random <= acc) {
        selected = d;
        break;
      }
    }

    //  stats async
    RouletteDrink.updateOne(
      { _id: selected._id },
      {
        $inc: { totalSpins: 1 },
        lastSelectedAt: new Date(),
      }
    ).exec();

    res.json({
      result: selected,
      meta: {
        totalOptions: normalized.length,
        totalWeight,
      },
    });
  } catch (err) {
    console.error("SPIN ERROR:", err);

    res.status(500).json({
      error: "Error en la ruleta",
    });
  }
};