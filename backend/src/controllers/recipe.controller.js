import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import mongoose from "mongoose";

/* ==============================
   HELPERS
============================== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ==============================
   GET ALL RECIPES
============================== */
export const getRecipes = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = {};
    if (type) filter.type = type;

    const recipes = await Recipe.find(filter)
      .populate("product")
      .populate("ingredients.inventoryItem")
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET ONE
============================== */
export const getRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const recipe = await Recipe.findById(id)
      .populate("product")
      .populate("ingredients.inventoryItem");

    if (!recipe) {
      return res.status(404).json({ error: "No encontrada" });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   CREATE
============================== */
export const createRecipe = async (req, res) => {
  try {
    const { product, ingredients, type, method, steps } = req.body;

    if (!product || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        error: "Producto e ingredientes son obligatorios",
      });
    }

    const exists = await Recipe.findOne({ product });
    if (exists) {
      return res.status(400).json({
        error: "Este producto ya tiene receta",
      });
    }

    const inventoryIds = ingredients.map((i) => i.inventoryItem);

    const inventoryItems = await InventoryItem.find({
      _id: { $in: inventoryIds },
    });

    const map = new Map(
      inventoryItems.map((i) => [i._id.toString(), i])
    );

    for (const ing of ingredients) {
      const item = map.get(ing.inventoryItem);

      if (!item) {
        return res.status(404).json({ error: "Ingrediente inválido" });
      }

      if (ing.quantity <= 0) {
        return res.status(400).json({ error: "Cantidad inválida" });
      }
    }

    const recipe = await Recipe.create({
      product,
      ingredients,
      type,
      method,
      steps,
    });

    const populated = await recipe.populate([
      "product",
      "ingredients.inventoryItem",
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   UPDATE
============================== */
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const allowed = ["ingredients", "method", "steps", "image", "category", "type"];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    if (updates.ingredients) {
      const inventoryIds = updates.ingredients.map(i => i.inventoryItem);

      const items = await InventoryItem.find({
        _id: { $in: inventoryIds },
      });

      const map = new Map(items.map(i => [i._id.toString(), i]));

      for (const ing of updates.ingredients) {
        const item = map.get(ing.inventoryItem);

        if (!item) {
          return res.status(400).json({ error: "Ingrediente inválido" });
        }

        if (ing.quantity <= 0) {
          return res.status(400).json({ error: "Cantidad inválida" });
        }
      }
    }

    const updated = await Recipe.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("product")
      .populate("ingredients.inventoryItem");

    if (!updated) {
      return res.status(404).json({ error: "No encontrada" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   DELETE
============================== */
export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const deleted = await Recipe.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "No encontrada" });
    }

    res.json({ message: "Eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   PROTOCOL (BARTENDER VIEW)
============================== */
export const getRecipeProtocol = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("product")
      .populate("ingredients.inventoryItem");

    if (!recipe) {
      return res.status(404).json({ error: "No encontrada" });
    }

    res.json({
      product: recipe.product,
      type: recipe.type,
      ingredients: recipe.ingredients.map(i => ({
        name: i.inventoryItem?.name,
        quantity: i.quantity,
        unit: i.unit,
      })),
      method: recipe.method || "Preparación estándar",
      steps:
        recipe.steps.length > 0
          ? recipe.steps
          : [
              { stepNumber: 1, instruction: "Preparar ingredientes" },
              { stepNumber: 2, instruction: "Medir cantidades" },
              { stepNumber: 3, instruction: "Mezclar / ejecutar" },
            ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   AVAILABILITY CHECK
============================== */
export const checkRecipeAvailability = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("ingredients.inventoryItem");

    if (!recipe) {
      return res.status(404).json({ error: "No encontrada" });
    }

    const missing = [];

    for (const ing of recipe.ingredients) {
      const item = ing.inventoryItem;

      if (!item || item.stock < ing.quantity) {
        missing.push({
          name: item?.name || "Desconocido",
          required: ing.quantity,
          available: item?.stock || 0,
        });
      }
    }

    res.json({
      available: missing.length === 0,
      missing,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   BY PRODUCT
============================== */
export const getRecipesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const recipes = await Recipe.find({ product: productId })
      .populate("product")
      .populate("ingredients.inventoryItem")
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};