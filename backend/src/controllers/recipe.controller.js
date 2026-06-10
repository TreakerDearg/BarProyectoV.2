import mongoose from "mongoose";
import Recipe        from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import Product       from "../models/Product.js";
import { logger }    from "../config/logger.js";
import { deleteImage } from "../config/cloudinary.js";
import {
  ok, created, badRequest, notFound, conflict,
} from "../utils/response.js";
import { emitRecipeEvent, RECIPE_EVENTS } from "../utils/socketEvents.js";
import { getIO } from "../socket/index.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateRecipe = (q) =>
  q.populate("product", "name type price")
   .populate("ingredients.inventoryItem", "name unit stock cost");

/* =========================================================
   GET ALL
========================================================= */
export const getRecipes = async (req, res, next) => {
  try {
    const { type, category, search, isActive, drinkStyle } = req.query;

    const filter = {};
    if (type)     filter.type     = type;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (drinkStyle) filter.drinkStyle = drinkStyle;
    if (search)   filter.$or = [
      { method:   { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];

    const recipes = await populateRecipe(Recipe.find(filter).sort({ createdAt: -1 })).lean();
    return ok(res, recipes);
  } catch (error) { throw error; }
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
  } catch (error) { throw error; }
};

/* =========================================================
   CREATE
========================================================= */
export const createRecipe = async (req, res, next) => {
  try {
    const {
      product, ingredients = [], type, method = "",
      steps = [], category = "general", image = "", imagePublicId = "",
    } = req.body;

    if (!product || !type) {
      return badRequest(res, "product y type son obligatorios");
    }
    if (!ingredients.length) {
      return badRequest(res, "Debes agregar al menos un ingrediente");
    }

    // Validación de datos de imagen (si se envían desde frontend sin multer)
    if (image && !imagePublicId) {
      return badRequest(res, "Se requiere imagePublicId cuando se proporciona una imagen");
    }
    if (imagePublicId && !image) {
      return badRequest(res, "Se requiere image URL cuando se proporciona imagePublicId");
    }
    if (image && !image.includes('cloudinary.com')) {
      return badRequest(res, "La URL de la imagen debe ser de Cloudinary");
    }

    const productDoc = await Product.findById(product);
    if (!productDoc) return badRequest(res, "Producto no encontrado");
    if (productDoc.type !== type) {
      return badRequest(res, "El tipo de receta debe coincidir con el tipo del producto");
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

    // Procesar imagen si se proporciona (ya subida por multer-storage-cloudinary)
    let imageUrl = image || "";
    let imagePublicIdFinal = imagePublicId || "";

    if (req.file) {
      imageUrl = req.file.secure_url || req.file.path;
      imagePublicIdFinal = req.file.public_id;
      logger.info(`[Recipe] Imagen subida a Cloudinary: ${imagePublicIdFinal}`);
    }

    const recipe = await Recipe.create({
      product, ingredients: cleanIngredients, type, method,
      steps: cleanSteps, category, image: imageUrl, imagePublicId: imagePublicIdFinal,
    });

    if (!productDoc.hasRecipe) {
      productDoc.hasRecipe = true;
      await productDoc.save();
    }

    const populated = await populateRecipe(Recipe.findById(recipe._id)).lean();

    // Emit socket event for recipe creation
    try {
      const io = getIO();
      if (io) {
        io.emit("recipe:created", { recipeId: recipe._id, productId: recipe.product });
      }
    } catch (socketError) {
      logger.error("[Recipe] Error emitting recipe:created event:", socketError);
    }

    logger.info(`[Recipe] Creada para producto: ${product}`);

    emitRecipeEvent(RECIPE_EVENTS.CREATED, populated);

    return created(res, populated, "Receta creada correctamente");
  } catch (error) {
    logger.error("[Recipe] Error creando receta:", error);
    throw error;
  }
};

/* =========================================================
   UPDATE
========================================================= */
export const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const ALLOWED = ["ingredients", "type", "method", "steps", "category", "image", "imagePublicId", "isActive", "drinkStyle"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    // Validación de datos de imagen (si se envían desde frontend sin multer)
    if (updates.image !== undefined) {
      if (updates.image && !updates.imagePublicId) {
        return badRequest(res, "Se requiere imagePublicId cuando se proporciona una imagen");
      }
      if (updates.imagePublicId && !updates.image) {
        return badRequest(res, "Se requiere image URL cuando se proporciona imagePublicId");
      }
      if (updates.image && !updates.image.includes('cloudinary.com')) {
        return badRequest(res, "La URL de la imagen debe ser de Cloudinary");
      }
    }

    // Manejar actualización de imagen (ya subida por multer-storage-cloudinary)
    if (req.file) {
      try {
        const existingRecipe = await Recipe.findById(id);
        if (existingRecipe?.imagePublicId) {
          await deleteImage(existingRecipe.imagePublicId);
          logger.info(`[Recipe] Imagen anterior eliminada: ${existingRecipe.imagePublicId}`);
        }

        updates.image = req.file.secure_url || req.file.path;
        updates.imagePublicId = req.file.public_id;
        logger.info(`[Recipe] Nueva imagen subida a Cloudinary: ${req.file.public_id}`);
      } catch (uploadError) {
        logger.error("[Recipe] Error actualizando imagen:", uploadError);
        logger.error("[Recipe] Detalles del error:", {
          message: uploadError.message,
          stack: uploadError.stack,
        });
        // Continuar sin actualizar imagen si falla
      }
    }

    const updated = await Recipe.findByIdAndUpdate(id, updates, {
      new: true, runValidators: true,
    });

    if (!updated) return notFound(res, "Receta no encontrada");

    const populated = await populateRecipe(Recipe.findById(id)).lean();
    logger.info(`[Recipe] Actualizada: ${id}`);

    // Emit socket event for recipe update
    try {
      const io = getIO();
      if (io) {
        io.emit("recipe:updated", { recipeId: id, productId: updated.product });
      }
    } catch (socketError) {
      logger.error("[Recipe] Error emitting recipe:updated event:", socketError);
    }

    emitRecipeEvent(RECIPE_EVENTS.UPDATED, populated);

    return ok(res, populated, "Receta actualizada correctamente");
  } catch (error) {
    logger.error("[Recipe] Error actualizando receta:", error);
    throw error;
  }
};

/* =========================================================
   DELETE
========================================================= */
export const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const recipe = await Recipe.findById(id);
    if (!recipe) return notFound(res, "Receta no encontrada");

    const productId = recipe.product?.toString();

    // Eliminar imagen de Cloudinary si existe
    if (recipe.imagePublicId) {
      try {
        await deleteImage(recipe.imagePublicId);
        logger.info(`[Recipe] Imagen eliminada: ${recipe.imagePublicId}`);
      } catch (deleteError) {
        logger.error(`[Recipe] Error eliminando imagen: ${deleteError.message}`);
        // Continuar aunque falle la eliminación de la imagen
      }
    }

    const deleted = await recipe.deleteOne();
    if (!deleted) return notFound(res, "Receta no encontrada");

    if (productId) {
      await Product.findByIdAndUpdate(productId, { hasRecipe: false });
    }

    // Emit socket event for recipe deletion
    try {
      const io = getIO();
      if (io) {
        io.emit("recipe:deleted", { recipeId: id, productId });
      }
    } catch (socketError) {
      logger.error("[Recipe] Error emitting recipe:deleted event:", socketError);
    }

    logger.info(`[Recipe] Eliminada: ${id}`);

    emitRecipeEvent(RECIPE_EVENTS.DELETED, { id, productId });

    return ok(res, null, "Receta eliminada correctamente");
  } catch (error) { throw error; }
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
  } catch (error) { throw error; }
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
  } catch (error) { throw error; }
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
  } catch (error) { throw error; }
};

/* =========================================================
   RECIPES WITH VARIANTS
========================================================= */
export const getRecipesWithVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!isValidId(productId)) return badRequest(res, "ID inválido");
    
    const recipes = await populateRecipe(
      Recipe.find({ product: productId }).sort({ isPrimary: -1, createdAt: -1 })
    ).lean();
    
    // Group by primary and variants
    const primary = recipes.find(r => r.isPrimary);
    const variants = recipes.filter(r => !r.isPrimary);
    
    return ok(res, {
      primary,
      variants,
      all: recipes
    });
  } catch (error) { throw error; }
};