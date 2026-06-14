import mongoose from "mongoose";
import Menu from "../models/Menu.js";
import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import { logger } from "../config/logger.js";
import {
  ok,
  notFound,
} from "../utils/response.js";
import {
  getCachedPublicMenus,
  cachePublicMenus,
  getCachedMenuBySlug,
  cacheMenuBySlug,
  getCachedPublicMenu,
  cachePublicMenu,
  get,
  set,
} from "../services/menuCacheService.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   POPULATE (OPTIMIZADO PARA PÚBLICO)
========================================================= */
const populateMenuPublic = (q) =>
  q.populate({
    path: "categories.products.product",
    select: "name price image available type",
  });

/* =========================================================
   AVAILABILITY CHECK (OPTIMIZADO)
========================================================= */
const checkAvailability = (recipe, inventoryMap) => {
  if (!recipe) return false;

  return recipe.ingredients.every((ing) => {
    const item = inventoryMap[ing.inventoryItem?.toString()];
    return item && item.stock >= ing.quantity;
  });
};

/* =========================================================
   BATCH AVAILABILITY CHECK (OPTIMIZADO PARA EVITAR N+1)
========================================================= */
const batchCheckAvailability = async (productIds) => {
  if (!productIds || productIds.length === 0) {
    return {};
  }

  // Batch fetch all recipes
  const recipes = await Recipe.find({
    product: { $in: productIds },
  }).lean();

  // Batch fetch all inventory items
  const ingredientIds = recipes.flatMap((r) =>
    r.ingredients.map((i) => i.inventoryItem)
  );

  const inventoryItems = await InventoryItem.find({
    _id: { $in: ingredientIds },
  }).lean();

  // Create maps for O(1) lookups
  const recipeMap = Object.fromEntries(
    recipes.map((r) => [r.product.toString(), r])
  );

  const inventoryMap = Object.fromEntries(
    inventoryItems.map((i) => [i._id.toString(), i])
  );

  // Calculate availability for all products
  const availabilityMap = {};
  for (const productId of productIds) {
    const recipe = recipeMap[productId];
    availabilityMap[productId] = recipe ? checkAvailability(recipe, inventoryMap) : true;
  }

  return availabilityMap;
};

/* =========================================================
   GET PUBLIC MENUS (OPTIMIZADO CON CACHE)
========================================================= */
export const getPublicMenus = async (req, res, next) => {
  try {
    const { type, featured, tags, page = 1, limit = 20, hideUnavailable = "false" } = req.query;

    const filter = { active: true, isPublic: true };
    if (type) filter.type = type;
    if (featured !== undefined) filter.featured = featured === "true";
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };

    // Try to get from cache first (only if not hiding unavailable)
    let cachedResult = null;
    if (hideUnavailable !== "true") {
      cachedResult = await getCachedPublicMenus({ type, featured, tags, page, limit });
    }

    if (cachedResult) {
      logger.info('[Cache] Hit for public menus list');
      return ok(res, cachedResult);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [menus, total] = await Promise.all([
      populateMenuPublic(
        Menu.find(filter)
          .select("name description slug type image color featured minPrice maxPrice tags categories")
          .sort({ featured: -1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
      ).lean(),
      Menu.countDocuments(filter)
    ]);

    // Solo verificar disponibilidad si hideUnavailable es true
    let result = menus;

    if (hideUnavailable === "true") {
      const productIds = menus.flatMap((m) =>
        m.categories.flatMap((c) =>
          c.products.map((p) => p.product?._id).filter(Boolean)
        )
      );

      if (productIds.length > 0) {
        // Use batch availability check to avoid N+1 queries
        const availabilityMap = await batchCheckAvailability(productIds);

        result = menus.map((menu) => {
          const m = menu.toObject();

          m.categories = m.categories.map((cat) => {
            const products = cat.products
              .map((p) => {
                const productId = p.product?._id?.toString();
                const available =
                  p.available &&
                  availabilityMap[productId];
                return { ...p, available };
              })
              .filter((p) => p.available);

            return { ...cat, products };
          }).filter((cat) => cat.products.length > 0);

          return m;
        }).filter((m) => m.categories.length > 0);
      }
    }

    const response = {
      data: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };

    // Cache the result (only if not hiding unavailable)
    if (hideUnavailable !== "true") {
      await cachePublicMenus({ type, featured, tags, page, limit }, response);
    }

    return ok(res, response);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   GET PUBLIC MENU BY SLUG (CON CACHE)
========================================================= */
export const getPublicMenuBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return notFound(res, "Slug es requerido");
    }

    // Try to get from cache first
    const cachedMenu = await getCachedMenuBySlug(slug);
    if (cachedMenu) {
      logger.info(`[Cache] Hit for menu slug: ${slug}`);
      return ok(res, cachedMenu);
    }

    const menu = await populateMenuPublic(
      Menu.findOne({ slug, active: true, isPublic: true })
        .select("name description slug type image color featured minPrice maxPrice tags categories")
    ).lean();

    if (!menu) {
      return notFound(res, "Menú no encontrado");
    }

    // Verificar disponibilidad completa usando batch check
    const productIds = menu.categories.flatMap((c) =>
      c.products.map((p) => p.product?._id).filter(Boolean)
    );

    // Use batch availability check to avoid N+1 queries
    const availabilityMap = await batchCheckAvailability(productIds);

    // Also fetch recipes for missing ingredients calculation
    const recipes = await Recipe.find({
      product: { $in: productIds },
    }).lean();

    const ingredientIds = recipes.flatMap((r) =>
      r.ingredients.map((i) => i.inventoryItem)
    );

    const inventoryItems = await InventoryItem.find({
      _id: { $in: ingredientIds },
    }).lean();

    const recipeMap = Object.fromEntries(
      recipes.map((r) => [r.product.toString(), r])
    );

    const inventoryMap = Object.fromEntries(
      inventoryItems.map((i) => [i._id.toString(), i])
    );

    const result = menu.toObject();
    result.categories = result.categories.map((cat) => {
      const products = cat.products.map((p) => {
        const productId = p.product?._id?.toString();
        const available =
          p.available &&
          availabilityMap[productId];

        const missingIngredients = available ? [] :
          recipeMap[productId]?.ingredients
            .filter((i) => {
              const item = inventoryMap[i.inventoryItem?.toString()];
              return !item || item.stock < i.quantity;
            })
            .map((i) => {
              const item = inventoryMap[i.inventoryItem?.toString()];
              return {
                name: item?.name || "Desconocido",
                required: i.quantity,
                available: item?.stock || 0,
                unit: i.unit,
              };
            }) || [];

        return { ...p, available, missingIngredients };
      });

      return { ...cat, products };
    });

    // Cache the result
    await cacheMenuBySlug(slug, result);

    return ok(res, result);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   GET FEATURED PUBLIC MENUS (CON CACHE)
========================================================= */
export const getFeaturedPublicMenus = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;

    // Try to get from cache first
    const cacheKey = `featured:${limit}`;
    const cachedMenus = await get(`menu:featured:${cacheKey}`);
    if (cachedMenus) {
      logger.info('[Cache] Hit for featured menus');
      return ok(res, cachedMenus);
    }

    const menus = await populateMenuPublic(
      Menu.find({ active: true, isPublic: true, featured: true })
        .select("name description slug type image color featured minPrice maxPrice tags")
        .sort({ featured: -1, createdAt: -1 })
        .limit(parseInt(limit))
    ).lean();

    // Cache the result
    await set(`menu:featured:${cacheKey}`, menus);

    return ok(res, menus);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   SEARCH PUBLIC MENUS (CON CACHE)
========================================================= */
export const searchPublicMenus = async (req, res, next) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;

    if (!q) {
      return notFound(res, "Query es requerido");
    }

    // Try to get from cache first
    const cacheKey = `search:${q}:${type}:${page}:${limit}`;
    const cachedResult = await get(`menu:${cacheKey}`);
    if (cachedResult) {
      logger.info(`[Cache] Hit for search: ${q}`);
      return ok(res, cachedResult);
    }

    const filter = {
      active: true,
      isPublic: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ]
    };

    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [menus, total] = await Promise.all([
      populateMenuPublic(
        Menu.find(filter)
          .select("name description slug type image color featured minPrice maxPrice tags")
          .sort({ featured: -1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
      ).lean(),
      Menu.countDocuments(filter)
    ]);

    const response = {
      data: menus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };

    // Cache the result (shorter TTL for search results)
    await set(`menu:${cacheKey}`, response, 60000); // 1 minute

    return ok(res, response);
  } catch (error) {
    throw error;
  }
};
