import mongoose from "mongoose";
import Product from "../models/Product.js";
import Recipe from "../models/Recipe.js";

/* ==============================
   HELPERS
============================== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ==============================
   GET PRODUCTS
============================== */
export const getProducts = async (req, res) => {
  try {
    const {
      type,
      category,
      available,
      search,
      tags,
    } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (available !== undefined) {
      filter.available = available === "true";
    }

    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET ONE PRODUCT
============================== */
export const getProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "No encontrado" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   CREATE PRODUCT
============================== */
export const createProduct = async (req, res) => {
  try {
    const { name, price, type, category } = req.body;

    if (!name || price === undefined || !type || !category) {
      return res.status(400).json({
        error: "Campos obligatorios faltantes",
      });
    }

    const exists = await Product.findOne({ name });

    if (exists) {
      return res.status(400).json({
        error: "El producto ya existe",
      });
    }

    const product = new Product(req.body);
    const saved = await product.save();

    res.status(201).json(saved);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   UPDATE PRODUCT (SAFE)
============================== */
export const updateProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "cost",
      "category",
      "subcategory",
      "type",
      "available",
      "image",
      "featured",
      "tags",
      "preparationTime",
    ];

    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    res.json(updated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   DELETE PRODUCT
============================== */
export const deleteProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    await product.deleteOne();

    res.json({ message: "Producto eliminado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   AUTO AVAILABILITY 
============================== */
export const syncProductAvailability = async (req, res) => {
  try {
    const products = await Product.find({ hasRecipe: true });

    for (const product of products) {
      const recipe = await Recipe.findOne({
        productId: product._id,
      }).populate("ingredients.ingredientId");

      if (!recipe) continue;

      let available = true;

      for (const ing of recipe.ingredients) {
        const ingredient = ing.ingredientId;

        if (!ingredient || ingredient.stock < ing.quantity) {
          available = false;
          break;
        }
      }

      product.available = available;
      await product.save();
    }

    res.json({ message: "Disponibilidad sincronizada" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET PRODUCT STATS 
============================== */
export const getProductStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();

    const byType = await Product.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const byCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const available = await Product.countDocuments({
      available: true,
    });

    const unavailable = await Product.countDocuments({
      available: false,
    });

    res.json({
      total,
      available,
      unavailable,
      byType,
      byCategory,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};