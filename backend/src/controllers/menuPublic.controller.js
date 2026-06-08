import mongoose from "mongoose";
import Menu from "../models/Menu.js";
import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import { logger } from "../config/logger.js";
import {
  ok,
  notFound,
} from "../utils/response.js";

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
   GET PUBLIC MENUS (OPTIMIZADO)
========================================================= */
export const getPublicMenus = async (req, res, next) => {
  try {
    const { type, featured, tags, page = 1, limit = 20, hideUnavailable = "false" } = req.query;

    const filter = { active: true, isPublic: true };
    if (type) filter.type = type;
    if (featured !== undefined) filter.featured = featured === "true";
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };

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

        result = menus.map((menu) => {
          const m = menu.toObject();

          m.categories = m.categories.map((cat) => {
            const products = cat.products
              .map((p) => {
                const productId = p.product?._id?.toString();
                const available =
                  p.available &&
                  checkAvailability(recipeMap[productId], inventoryMap);
                return { ...p, available };
              })
              .filter((p) => p.available);

            return { ...cat, products };
          }).filter((cat) => cat.products.length > 0);

          return m;
        }).filter((m) => m.categories.length > 0);
      }
    }

    return ok(res, {
      data: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   GET PUBLIC MENU BY SLUG
========================================================= */
export const getPublicMenuBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return notFound(res, "Slug es requerido");
    }

    const menu = await populateMenuPublic(
      Menu.findOne({ slug, active: true, isPublic: true })
        .select("name description slug type image color featured minPrice maxPrice tags categories")
    ).lean();

    if (!menu) {
      return notFound(res, "Menú no encontrado");
    }

    // Verificar disponibilidad completa
    const productIds = menu.categories.flatMap((c) =>
      c.products.map((p) => p.product?._id).filter(Boolean)
    );

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
          checkAvailability(recipeMap[productId], inventoryMap);

        const missingIngredients = available ? [] :
          recipeMap[productId]?.ingredients
            .filter((i) => !i.inventoryItem || i.inventoryItem.stock < i.quantity)
            .map((i) => ({
              name: i.inventoryItem?.name || "Desconocido",
              required: i.quantity,
              available: i.inventoryItem?.stock || 0,
              unit: i.unit,
            })) || [];

        return { ...p, available, missingIngredients };
      });

      return { ...cat, products };
    });

    return ok(res, result);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   GET FEATURED PUBLIC MENUS
========================================================= */
export const getFeaturedPublicMenus = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;

    const menus = await populateMenuPublic(
      Menu.find({ active: true, isPublic: true, featured: true })
        .select("name description slug type image color featured minPrice maxPrice tags")
        .sort({ featured: -1, createdAt: -1 })
        .limit(parseInt(limit))
    ).lean();

    return ok(res, menus);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   SEARCH PUBLIC MENUS
========================================================= */
export const searchPublicMenus = async (req, res, next) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;

    if (!q) {
      return notFound(res, "Query es requerido");
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

    return ok(res, {
      data: menus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    throw error;
  }
};
