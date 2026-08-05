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
import { toRecipeDashboardDTO, toRecipeAnalyticsDTO } from "../dto/recipe.dto.js";

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
      isPrimary = true, variantName = "", parentId = null,
    } = req.body;

    if (!product || !type) {
      return badRequest(res, "product y type son obligatorios");
    }
    if (!ingredients.length) {
      return badRequest(res, "Debes agregar al menos un ingrediente");
    }

    // Validación de consistencia de imagen (image ↔ imagePublicId)
    if (image && !imagePublicId) {
      return badRequest(res, "Se requiere imagePublicId cuando se proporciona una imagen");
    }
    if (imagePublicId && !image) {
      return badRequest(res, "Se requiere image URL cuando se proporciona imagePublicId");
    }

    const productDoc = await Product.findById(product);
    if (!productDoc) return badRequest(res, "Producto no encontrado");
    if (productDoc.type !== type) {
      return badRequest(res, "El tipo de receta debe coincidir con el tipo del producto");
    }

    // Si es una variante, verificar que parentId existe y es válido
    if (parentId) {
      if (!isValidId(parentId)) {
        return badRequest(res, "parentId inválido");
      }
      const parentRecipe = await Recipe.findById(parentId);
      if (!parentRecipe) {
        return badRequest(res, "Receta padre no encontrada");
      }
      if (parentRecipe.product.toString() !== product.toString()) {
        return badRequest(res, "La variante debe pertenecer al mismo producto que la receta padre");
      }
    }

    // Si no es primaria y no tiene parentId, es una variante sin padre (no permitido)
    if (!isPrimary && !parentId) {
      return badRequest(res, "Las variantes deben tener una receta padre (parentId)");
    }

    // Si es primaria, verificar que no exista otra receta primaria para este producto
    if (isPrimary) {
      const exists = await Recipe.findOne({ product, isPrimary: true });
      if (exists) return conflict(res, "Ya existe una receta primaria para este producto");
    }

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
      isPrimary, variantName, parentId,
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
        io.emit("recipe:created", { recipeId: recipe._id, productId: recipe.product, isPrimary, parentId });
      }
    } catch (socketError) {
      logger.error("[Recipe] Error emitting recipe:created event:", socketError);
    }

    logger.info(`[Recipe] Creada para producto: ${product} (isPrimary: ${isPrimary}, parentId: ${parentId})`);

    emitRecipeEvent(RECIPE_EVENTS.CREATED, populated);

    return created(res, populated, isPrimary ? "Receta creada correctamente" : "Variante creada correctamente");
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

    // Validación de consistencia de imagen (image ↔ imagePublicId)
    if (updates.image !== undefined) {
      if (updates.image && !updates.imagePublicId) {
        return badRequest(res, "Se requiere imagePublicId cuando se proporciona una imagen");
      }
      if (updates.imagePublicId && !updates.image) {
        return badRequest(res, "Se requiere image URL cuando se proporciona imagePublicId");
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

/* =========================================================
   DRINK PRODUCTS WITH RECIPES AND VARIANTS
========================================================= */
export const getDrinkProductsWithRecipes = async (req, res, next) => {
  try {
    const { category, available } = req.query;

    const productFilter = { type: "drink" };
    if (category) productFilter.category = category;
    if (available !== undefined) productFilter.available = available === "true";

    const products = await Product.find(productFilter).sort({ name: 1 }).lean();

    const productIds = products.map(p => p._id);
    
    // Get all recipes for these products (primary and variants)
    const recipes = await populateRecipe(
      Recipe.find({ product: { $in: productIds } }).sort({ isPrimary: -1, createdAt: -1 })
    ).lean();

    // Group recipes by product
    const recipeMap = new Map();
    recipes.forEach(recipe => {
      const productId = recipe.product.toString();
      if (!recipeMap.has(productId)) {
        recipeMap.set(productId, {
          primary: null,
          variants: [],
          all: []
        });
      }
      const productRecipes = recipeMap.get(productId);
      if (recipe.isPrimary) {
        productRecipes.primary = recipe;
      } else {
        productRecipes.variants.push(recipe);
      }
      productRecipes.all.push(recipe);
    });

    // Combine products with their recipes
    const productsWithRecipes = products.map(product => {
      const productRecipes = recipeMap.get(product._id.toString()) || {
        primary: null,
        variants: [],
        all: []
      };

      return {
        ...product,
        hasRecipe: !!productRecipes.primary,
        primaryRecipe: productRecipes.primary,
        variants: productRecipes.variants,
        allRecipes: productRecipes.all,
        totalVariants: productRecipes.variants.length
      };
    });

    // Filter to only include products that have at least a primary recipe
    const productsWithPrimaryRecipes = productsWithRecipes.filter(p => p.hasRecipe);

    return ok(res, productsWithPrimaryRecipes);
  } catch (error) { throw error; }
};

/* =========================================================
   DASHBOARD STATS
========================================================= */
export const getDashboardStats = async (req, res, next) => {
  try {
    const { type, category } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    const recipes = await Recipe.find(filter)
      .populate("product", "name price")
      .lean();

    const dashboardData = await toRecipeDashboardDTO(recipes);

    return ok(res, dashboardData);
  } catch (error) { throw error; }
};

/* =========================================================
   DASHBOARD RECENT RECIPES
========================================================= */
export const getDashboardRecent = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const recentRecipes = await Recipe.find()
      .populate("product", "name price category type image")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const enrichedRecipes = recentRecipes.map(r => ({
      _id: r._id,
      name: r.product?.name || "Sin nombre",
      image: r.image || r.product?.image || "",
      category: r.category,
      type: r.type,
      price: r.product?.price || 0,
      totalCost: r.totalCost,
      margin: calculateMargin(r.product?.price, r.totalCost),
      createdAt: r.createdAt,
    }));

    return ok(res, enrichedRecipes);
  } catch (error) { throw error; }
};

/* =========================================================
   DASHBOARD WARNINGS
========================================================= */
export const getDashboardWarnings = async (req, res, next) => {
  try {
    const recipes = await Recipe.find()
      .populate("product", "name price")
      .populate("ingredients.inventoryItem", "name stock minStock")
      .lean();

    const warnings = [];

    // Recetas sin imagen
    const recipesWithoutImage = recipes.filter(r => !r.image && !r.product?.image);
    if (recipesWithoutImage.length > 0) {
      warnings.push({
        id: 'no-image',
        type: 'no-image',
        title: 'Recetas sin imagen',
        description: `${recipesWithoutImage.length} recetas sin fotografía`,
        severity: 'medium',
        count: recipesWithoutImage.length,
        items: recipesWithoutImage.slice(0, 5).map(r => ({
          _id: r._id,
          name: r.product?.name || "Sin nombre",
        })),
      });
    }

    // Recetas con bajo margen
    const lowMarginRecipes = recipes.filter(r => calculateMargin(r.product?.price, r.totalCost) < 30);
    if (lowMarginRecipes.length > 0) {
      warnings.push({
        id: 'low-margin',
        type: 'low-margin',
        title: 'Margen bajo',
        description: `${lowMarginRecipes.length} recetas con margen < 30%`,
        severity: 'medium',
        count: lowMarginRecipes.length,
        items: lowMarginRecipes.slice(0, 5).map(r => ({
          _id: r._id,
          name: r.product?.name || "Sin nombre",
          margin: calculateMargin(r.product?.price, r.totalCost),
        })),
      });
    }

    // Ingredientes con stock crítico
    const lowStockIngredients = [];
    recipes.forEach(r => {
      r.ingredients.forEach(ing => {
        if (ing.inventoryItem && ing.inventoryItem.stock <= ing.inventoryItem.minStock) {
          lowStockIngredients.push({
            recipeId: r._id,
            recipeName: r.product?.name || "Sin nombre",
            ingredientName: ing.inventoryItem.name,
            required: ing.quantity,
            available: ing.inventoryItem.stock,
            unit: ing.unit,
          });
        }
      });
    });

    if (lowStockIngredients.length > 0) {
      warnings.push({
        id: 'low-stock',
        type: 'low-stock',
        title: 'Stock bajo',
        description: `${lowStockIngredients.length} ingredientes con stock crítico`,
        severity: 'high',
        count: lowStockIngredients.length,
        items: lowStockIngredients.slice(0, 5),
      });
    }

    return ok(res, warnings);
  } catch (error) { throw error; }
};

/* =========================================================
   DASHBOARD SUGGESTIONS
========================================================= */
export const getDashboardSuggestions = async (req, res, next) => {
  try {
    const suggestions = [];

    // Recetas populares sin variantes
    const recipesWithoutVariants = await Recipe.find({ isPrimary: true })
      .populate("product", "name price")
      .lean();

    for (const recipe of recipesWithoutVariants) {
      const variantCount = await Recipe.countDocuments({ parentId: recipe._id });
      if (variantCount === 0 && recipe.product?.price > 10) {
        suggestions.push({
          id: 'create-variant',
          type: 'create-variant',
          title: 'Crear variante',
          description: `${recipe.product?.name} tiene potencial para variante sin alcohol`,
          recipeId: recipe._id,
          recipeName: recipe.product?.name,
        });
      }
    }

    // Recetas sin decoración
    const recipesWithoutDecoration = await Recipe.find({ 
      $or: [
        { decorationIds: { $exists: false } },
        { decorationIds: { $size: 0 } }
      ]
    }).populate("product", "name").lean();

    recipesWithoutDecoration.slice(0, 3).forEach(r => {
      suggestions.push({
        id: 'add-decoration',
        type: 'add-decoration',
        title: 'Agregar decoración',
        description: `${r.product?.name} podría usar decoración para mejorar presentación`,
        recipeId: r._id,
        recipeName: r.product?.name,
      });
    });

    return ok(res, suggestions);
  } catch (error) { throw error; }
};

/* =========================================================
   RECIPE ANALYTICS
========================================================= */
export const getRecipeAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const analyticsData = await toRecipeAnalyticsDTO(id);
    if (!analyticsData) return notFound(res, "Receta no encontrada");

    return ok(res, analyticsData);
  } catch (error) { throw error; }
};

/* =========================================================
   RECIPE TIMELINE
========================================================= */
export const getRecipeTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const recipe = await Recipe.findById(id).lean();
    if (!recipe) return notFound(res, "Receta no encontrada");

    // Generar timeline basado en timestamps y cambios
    const timeline = [
      {
        _id: `${recipe._id}-created`,
        version: '1.0',
        type: 'created',
        date: recipe.createdAt,
        author: 'System',
        description: 'Receta creada',
        changes: [],
      },
    ];

    if (recipe.updatedAt && recipe.updatedAt.getTime() !== recipe.createdAt.getTime()) {
      timeline.push({
        _id: `${recipe._id}-updated`,
        version: '1.1',
        type: 'updated',
        date: recipe.updatedAt,
        author: 'System',
        description: 'Receta actualizada',
        changes: ['Ingredientes modificados', 'Pasos actualizados'],
      });
    }

    // Agregar eventos de variantes
    if (recipe.parentId) {
      timeline.push({
        _id: `${recipe._id}-variant`,
        version: '2.0',
        type: 'variant_created',
        date: recipe.createdAt,
        author: 'System',
        description: `Variante creada desde receta padre`,
        changes: [`Variante: ${recipe.variantName || 'Sin nombre'}`],
      });
    }

    return ok(res, timeline.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) { throw error; }
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */
function calculateMargin(price, cost) {
  if (!price || price === 0) return 0;
  return Number(((price - cost) / price * 100).toFixed(2));
}