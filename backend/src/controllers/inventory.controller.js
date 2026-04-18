import InventoryItem from "../models/InventoryItem.js";
import mongoose from "mongoose";

/* ==============================
   HELPERS
============================== */
const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const sanitizeNumber = (value, def = 0) =>
  value !== undefined ? Number(value) : def;

/* ==============================
   GET ALL (con filtros avanzados)
============================== */
export const getInventory = async (req, res) => {
  try {
    const {
      category,
      search,
      sector,
      lowStock,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (sector && sector !== "all") {
      filter.sector = sector;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (lowStock === "true") {
      filter.$expr = { $lte: ["$stock", "$minStock"] };
    }

    const items = await InventoryItem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await InventoryItem.countDocuments(filter);

    res.json({
      data: items,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   GET ONE
============================== */
export const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const item = await InventoryItem.findById(id);

    if (!item) {
      return res.status(404).json({
        message: "Item no encontrado",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   CREATE
============================== */
export const createInventoryItem = async (req, res) => {
  try {
    let {
      name,
      stock,
      unit,
      category,
      minStock,
      maxStock,
      cost, // 👈 ahora correcto
      sector,
      supplier,
      location,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Nombre y categoría son obligatorios",
      });
    }

    const newItem = new InventoryItem({
      name: name.trim(),
      stock: Number(stock ?? 0),
      unit,
      category: category.trim().toLowerCase(),
      minStock: Number(minStock ?? 5),
      maxStock: Number(maxStock ?? 100),
      cost: Number(cost ?? 0),
      sector,
      supplier,
      location,
    });

    const saved = await newItem.save();

    return res.status(201).json(saved);
  } catch (error) {
    console.error("CREATE INVENTORY ERROR:", error);

    return res.status(500).json({
      message: "Error creando item de inventario",
      error: error.message,
    });
  }
};
/* ==============================
   UPDATE (controlado)
============================== */
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await InventoryItem.findByIdAndUpdate(
      id,
      {
        ...req.body,
        category: req.body.category?.toLowerCase(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "No encontrado" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error actualizando item",
      error: error.message,
    });
  }
};
/* ==============================
   DELETE (seguro)
============================== */
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const deleted = await InventoryItem.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Item no encontrado",
      });
    }

    res.json({ message: "Item eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   AJUSTE DE STOCK (PRO)
============================== */
export const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    let { amount, type } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    amount = sanitizeNumber(amount, 0);

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount inválido" });
    }

    const item = await InventoryItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item no encontrado" });
    }

    if (type === "add") item.stock += amount;
    if (type === "subtract") item.stock -= amount;

    if (item.stock < 0) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: "Error ajustando stock",
      error: error.message,
    });
  }
};

/* ==============================
   GET CATEGORIES
============================== */
export const getInventoryCategories = async (req, res) => {
  try {
    const categories = await InventoryItem.distinct("category");

    categories.sort((a, b) => a.localeCompare(b));

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   STATS (MEJORADO)
============================== */
export const getInventoryStats = async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments();

    const stockData = await InventoryItem.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
          averageStock: { $avg: "$stock" },
        },
      },
    ]);

    const lowStockItems = await InventoryItem.countDocuments({
      $expr: { $lte: ["$stock", "$minStock"] },
    });

    const outOfStockItems = await InventoryItem.countDocuments({
      stock: { $lte: 0 },
    });

    const categories = await InventoryItem.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
          _id: 0,
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
      message: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};