import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import mongoose from "mongoose";

/* ==============================
   HELPERS
============================== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* helper estable */
const populateRecipe = (query) =>
  query
    .populate("product")
    .populate("ingredients.inventoryItem");

/* ==============================
   GET ALL
============================== */
export const getRecipes = async (req, res) => {
  try {
    const { type, category, search } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { method: { $regex: search, $options: "i" } },
      ];
    }

    const recipes = await populateRecipe(
      Recipe.find(filter).sort({ createdAt: -1 })
    );

    res.json(recipes);
  } catch (error) {
    res.status(500).json({
      error: "Error obteniendo recetas",
      details: error.message,
    });
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

    const recipe = await populateRecipe(
      Recipe.findById(id)
    );

    if (!recipe) {
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({
      error: "Error obteniendo receta",
      details: error.message,
    });
  }
};

/* ==============================
   CREATE
============================== */
export const createRecipe = async (req, res) => {
  try {
    const {
      product,
      ingredients = [],
      type,
      method = "",
      steps = [],
      category = "general",
      image = "",
    } = req.body;

    /* VALIDACIONES */
    if (!product || !type) {
      return res.status(400).json({
        error: "product y type requeridos",
      });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        error: "Ingredientes requeridos",
      });
    }

    /* DUPLICADO */
    const exists = await Recipe.findOne({ product });
    if (exists) {
      return res.status(409).json({
        error: "Ya existe receta para este producto",
      });
    }

    /* CLEAN INGREDIENTS */
    const cleanIngredients = ingredients
      .filter(i => i.inventoryItem && i.quantity > 0)
      .map(i => ({
        inventoryItem: i.inventoryItem,
        quantity: Number(i.quantity),
        unit: i.unit || "ml",
        order: i.order || 0,
      }));

    /* VALIDAR INVENTARIO */
    const inventory = await InventoryItem.find({
      _id: { $in: cleanIngredients.map(i => i.inventoryItem) },
    }).lean();

    const map = new Map(
      inventory.map(i => [i._id.toString(), i])
    );

    for (const ing of cleanIngredients) {
      if (!map.has(ing.inventoryItem.toString())) {
        return res.status(400).json({
          error: "Ingrediente inválido",
        });
      }
    }

    /* CLEAN STEPS */
    const cleanSteps = Array.isArray(steps)
      ? steps.map((s, i) => ({
          stepNumber: s.stepNumber || i + 1,
          instruction:
            typeof s === "string" ? s : s.instruction || "",
        }))
      : [];

    /* CREATE */
    const recipe = await Recipe.create({
      product,
      ingredients: cleanIngredients,
      type,
      method,
      steps: cleanSteps,
      category,
      image,
    });

    const populated = await populateRecipe(
      Recipe.findById(recipe._id)
    );

    res.status(201).json(populated);
  } catch (error) {
    console.error("CREATE_RECIPE_ERROR:", error);

    res.status(500).json({
      error: "Error creando receta",
      details: error.message,
    });
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

    const updated = await Recipe.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    const populated = await populateRecipe(
      Recipe.findById(updated._id)
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({
      error: "Error actualizando receta",
      details: error.message,
    });
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
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    res.json({ message: "Receta eliminada" });
  } catch (error) {
    res.status(500).json({
      error: "Error eliminando receta",
      details: error.message,
    });
  }
};

/* ==============================
   PROTOCOL (BARTENDER VIEW)
============================== */
export const getRecipeProtocol = async (req, res) => {
  try {
    const recipe = await populateRecipe(
      Recipe.findById(req.params.id)
    );

    if (!recipe) {
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    res.json({
      product: recipe.product,
      type: recipe.type,
      ingredients: recipe.ingredients.map(i => ({
        name: i.inventoryItem?.name,
        quantity: i.quantity,
        unit: i.unit,
      })),
      method: recipe.method || "Estándar",
      steps: recipe.steps.length
        ? recipe.steps
        : [
            { stepNumber: 1, instruction: "Preparar" },
            { stepNumber: 2, instruction: "Mezclar" },
          ],
    });
  } catch (error) {
    res.status(500).json({
      error: "Error protocol",
      details: error.message,
    });
  }
};

/* ==============================
   AVAILABILITY
============================== */
export const checkRecipeAvailability = async (req, res) => {
  try {
    const recipe = await populateRecipe(
      Recipe.findById(req.params.id)
    );

    if (!recipe) {
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    const missing = recipe.ingredients.filter(i => {
      const item = i.inventoryItem;
      return !item || item.stock < i.quantity;
    });

    res.json({
      available: missing.length === 0,
      missing: missing.map(i => ({
        name: i.inventoryItem?.name,
        required: i.quantity,
        available: i.inventoryItem?.stock || 0,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: "Error availability",
      details: error.message,
    });
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

    const recipes = await populateRecipe(
      Recipe.find({ product: productId }).sort({ createdAt: -1 })
    );

    res.json(recipes);
  } catch (error) {
    res.status(500).json({
      error: "Error by product",
      details: error.message,
    });
  }
};