import mongoose from "mongoose";
import Recipe        from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import { logger }    from "../config/logger.js";
import {
  ok, created, badRequest, notFound, conflict,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateRecipe = (q) =>
  q.populate("product", "name type price")
   .populate("ingredients.inventoryItem", "name unit stock cost");

/* =========================================================
   GET ALL
========================================================= */
export const getRecipes = async (req, res, next) => {
  try {
    const { type, category, search, isActive } = req.query;

    const filter = {};
    if (type)     filter.type     = type;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search)   filter.$or = [
      { method:   { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];

    const recipes = await populateRecipe(Recipe.find(filter).sort({ createdAt: -1 })).lean();
    return ok(res, recipes);
  } catch (error) { next(error); }
};

/* =========================================================
   GET ONE
========================================================= */
export const getRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const recipe = await populateRecipe(Recipe.findById(id)).lean();
    if (!recipe) return notFound(res, "Receta no encontrada");

    return ok(res, recipe);
  } catch (error) { next(error); }
};

/* =========================================================
   CREATE
========================================================= */
export const createRecipe = async (req, res, next) => {
  try {
    const {
      product, ingredients = [], type, method = "",
      steps = [], category = "general", image = "",
    } = req.body;

    if (!product || !type) {
      return badRequest(res, "product y type son obligatorios");
    }
    if (!ingredients.length) {
      return badRequest(res, "Debes agregar al menos un ingrediente");
    }

    const exists = await Recipe.findOne({ product });
    if (exists) return conflict(res, "Ya existe una receta para este producto");

    /* Limpiar y validar ingredientes */
    const cleanIngredients = ingredients
      .filter((i) => i.inventoryItem && i.quantity > 0)
      .map((i) => ({
        inventoryItem:      i.inventoryItem,
        quantity:           Number(i.quantity),
        unit:               i.unit || "ml",
        order:              i.order || 0,
        baseUnitMultiplier: i.baseUnitMultiplier || 1,
      }));

    const inventoryItems = await InventoryItem.find({
      _id: { $in: cleanIngredients.map((i) => i.inventoryItem) },
    }).lean();

    if (inventoryItems.length !== cleanIngredients.length) {
      return badRequest(res, "Uno o más ingredientes no existen en el inventario");
    }

    /* Limpiar steps */
    const cleanSteps = steps.map((s, i) => ({
      stepNumber:  s.stepNumber  || i + 1,
      instruction: typeof s === "string" ? s : s.instruction || "",
    }));

    const recipe = await Recipe.create({
      product, ingredients: cleanIngredients, type, method,
      steps: cleanSteps, category, image,
    });

    const populated = await populateRecipe(Recipe.findById(recipe._id)).lean();

    logger.info(`[Recipe] Creada para producto: ${product}`);
    return created(res, populated, "Receta creada correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   UPDATE
========================================================= */
export const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const ALLOWED = ["ingredients", "type", "method", "steps", "category", "image", "isActive"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    const updated = await Recipe.findByIdAndUpdate(id, updates, {
      new: true, runValidators: true,
    });

    if (!updated) return notFound(res, "Receta no encontrada");

    const populated = await populateRecipe(Recipe.findById(id)).lean();
    logger.info(`[Recipe] Actualizada: ${id}`);

    return ok(res, populated, "Receta actualizada correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   DELETE
========================================================= */
export const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const deleted = await Recipe.findByIdAndDelete(id);
    if (!deleted) return notFound(res, "Receta no encontrada");

    logger.info(`[Recipe] Eliminada: ${id}`);
    return ok(res, null, "Receta eliminada correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   PROTOCOL (vista bartender)
========================================================= */
export const getRecipeProtocol = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const recipe = await populateRecipe(Recipe.findById(id)).lean();
    if (!recipe) return notFound(res, "Receta no encontrada");

    return ok(res, {
      product: recipe.product,
      type:    recipe.type,
      ingredients: recipe.ingredients.map((i) => ({
        name:     i.inventoryItem?.name,
        quantity: i.quantity,
        unit:     i.unit,
      })),
      method: recipe.method || "Estándar",
      steps:  recipe.steps.length
        ? recipe.steps
        : [
            { stepNumber: 1, instruction: "Preparar ingredientes" },
            { stepNumber: 2, instruction: "Mezclar según receta" },
          ],
    });
  } catch (error) { next(error); }
};

/* =========================================================
   CHECK AVAILABILITY
========================================================= */
export const checkRecipeAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const recipe = await populateRecipe(Recipe.findById(id)).lean();
    if (!recipe) return notFound(res, "Receta no encontrada");

    const missing = recipe.ingredients
      .filter((i) => !i.inventoryItem || i.inventoryItem.stock < i.quantity)
      .map((i) => ({
        name:      i.inventoryItem?.name || "Desconocido",
        required:  i.quantity,
        available: i.inventoryItem?.stock || 0,
        unit:      i.unit,
      }));

    return ok(res, {
      available: missing.length === 0,
      missing,
    });
  } catch (error) { next(error); }
};

/* =========================================================
   BY PRODUCT
========================================================= */
export const getRecipesByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!isValidId(productId)) return badRequest(res, "ID inválido");

    const recipes = await populateRecipe(
      Recipe.find({ product: productId }).sort({ createdAt: -1 })
    ).lean();

    return ok(res, recipes);
  } catch (error) { next(error); }
};