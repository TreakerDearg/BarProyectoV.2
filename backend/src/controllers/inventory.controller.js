import Ingredient from "../models/Ingredient.js";
import mongoose from "mongoose";

/* ==============================
   GET ALL
============================== */
export const getInventory = async (req, res) => {
  try {
    const { category, search } = req.query;

    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const items = await Ingredient.find(filter).sort({
      createdAt: -1,
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   GET ONE
============================== */
export const getIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const item = await Ingredient.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Ingrediente no encontrado" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   CREATE
============================== */
export const createIngredient = async (req, res) => {
  try {
    const {
      name,
      stock = 0,
      unit = "ml",
      category = "Otros",
      minStock = 5,
      maxStock = 100,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "El nombre es obligatorio",
      });
    }

    const existing = await Ingredient.findOne({ name });
    if (existing) {
      return res.status(400).json({
        message: "El ingrediente ya existe",
      });
    }

    const newItem = new Ingredient({
      name,
      stock,
      unit,
      category,
      minStock,
      maxStock,
    });

    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   UPDATE
============================== */
export const updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const updated = await Ingredient.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Ingrediente no encontrado",
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   DELETE
============================== */
export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const deleted = await Ingredient.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Ingrediente no encontrado",
      });
    }

    res.json({ message: "Ingrediente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   GET INVENTORY CATEGORIES
============================== */
export const getInventoryCategories = async (req, res) => {
  try {
    const categories = await Ingredient.distinct("category");

    // Ordenar alfabéticamente
    categories.sort((a, b) => a.localeCompare(b));

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   GET INVENTORY STATS
============================== */
export const getInventoryStats = async (req, res) => {
  try {
    // Total de ingredientes
    const totalItems = await Ingredient.countDocuments();

    // Stock total
    const stockData = await Ingredient.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
          averageStock: { $avg: "$stock" },
        },
      },
    ]);

    // Productos con bajo stock
    const lowStockItems = await Ingredient.countDocuments({
      stock: { $lte: 5 },
    });

    // Productos sin stock
    const outOfStockItems = await Ingredient.countDocuments({
      stock: { $lte: 0 },
    });

    // Ingredientes por categoría
    const categories = await Ingredient.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: "$count",
        },
      },
      { $sort: { value: -1 } },
    ]);

    res.json({
      totalItems,
      totalStock: stockData[0]?.totalStock || 0,
      averageStock: Math.round(stockData[0]?.averageStock || 0),
      lowStockItems,
      outOfStockItems,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener estadísticas del inventario",
      error: error.message,
    });
  }
};