import mongoose from "mongoose";
import Menu from "../models/Menu.js";
import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import { logger } from "../config/logger.js";
import {
  ok,
  created,
  badRequest,
  notFound,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   POPULATE (OPTIMIZADO)
========================================================= */
const populateMenu = (q) =>
  q.populate({
    path: "categories.products.product",
    select: "name price image available",
  });

/* =========================================================
   NORMALIZE INPUT (🔥 CLAVE)
   Permite formato simple desde frontend
========================================================= */
const normalizeMenuPayload = (body) => {
  const {
    name,
    description = "",
    type = "mixed",
    active = true,
    categories,
  } = body;

  // 🔥 FORMATO AVANZADO (ya estructurado de la nueva MenuForm)
  if (categories && Array.isArray(categories)) {
    return {
      name,
      description,
      type,
      active,
      categories
    };
  }

  // 🔥 FORMATO LEGACY (frontend simple)
  if (body.products && Array.isArray(body.products)) {
    return {
      name,
      description,
      type,
      active: body.available ?? active,
      categories: [
        {
          name: body.category || "General",
          products: body.products.map((id) => ({
            product: id,
            available: true,
          })),
        },
      ],
    };
  }

  return body;
};

/* =========================================================
   VALIDATION
========================================================= */
const validateMenu = (data) => {
  if (!data.name || !data.name.trim()) {
    return "El nombre es obligatorio";
  }

  if (!data.categories || !Array.isArray(data.categories)) {
    return "categories debe ser un array";
  }

  for (const cat of data.categories) {
    if (!cat.products || !Array.isArray(cat.products)) {
      return "Cada categoría debe tener productos";
    }

    for (const p of cat.products) {
      if (!isValidId(p.product)) {
        return "Producto inválido";
      }
    }
  }

  return null;
};

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
   GET ALL
========================================================= */
export const getMenus = async (req, res, next) => {
  try {
    const { type, active } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (active !== undefined) filter.active = active === "true";

    const menus = await populateMenu(
      Menu.find(filter).sort({ createdAt: -1 })
    ).lean();

    return ok(res, menus);
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   CREATE 
========================================================= */
export const createMenu = async (req, res, next) => {
  try {
    //  NORMALIZACIÓN
    const normalized = normalizeMenuPayload(req.body);

    //  VALIDACIÓN
    const errorMsg = validateMenu(normalized);
    if (errorMsg) return badRequest(res, errorMsg);

    const menu = await Menu.create(normalized);

    const populated = await populateMenu(
      Menu.findById(menu._id)
    ).lean();

    logger.info(`[Menu] Creado: ${menu.name}`);

    return created(res, populated, "Menú creado correctamente");
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE
========================================================= */
export const updateMenu = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return badRequest(res, "ID inválido");
    }

    const normalized = normalizeMenuPayload(req.body);

    const errorMsg = validateMenu(normalized);
    if (errorMsg) return badRequest(res, errorMsg);

    const updated = await populateMenu(
      Menu.findByIdAndUpdate(req.params.id, normalized, {
        new: true,
        runValidators: true,
      })
    ).lean();

    if (!updated) return notFound(res, "Menú no encontrado");

    logger.info(`[Menu] Actualizado: ${updated.name}`);

    return ok(res, updated, "Menú actualizado correctamente");
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE
========================================================= */
export const deleteMenu = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return badRequest(res, "ID inválido");
    }

    const deleted = await Menu.findByIdAndDelete(req.params.id);

    if (!deleted) return notFound(res, "Menú no encontrado");

    logger.info(`[Menu] Eliminado: ${deleted.name}`);

    return ok(res, null, "Menú eliminado correctamente");
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   PUBLIC MENU (OPTIMIZADO PRO)
========================================================= */
export const getPublicMenu = async (req, res, next) => {
  try {
    const { type, hideUnavailable = "false" } = req.query;

    const filter = { active: true, isPublic: true };
    if (type) filter.type = type;

    const menus = await populateMenu(Menu.find(filter));

    const productIds = menus.flatMap((m) =>
      m.categories.flatMap((c) =>
        c.products.map((p) => p.product?._id).filter(Boolean)
      )
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

    const result = menus.map((menu) => {
      const m = menu.toObject();

      m.categories = m.categories.map((cat) => {
        let products = cat.products.map((p) => {
          const productId = p.product?._id?.toString();

          const available =
            p.available &&
            checkAvailability(recipeMap[productId], inventoryMap);

          return { ...p, available };
        });

        if (hideUnavailable === "true") {
          products = products.filter((p) => p.available);
        }

        return { ...cat, products };
      });

      return m;
    });

    return ok(res, result);
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ONE MENU BY ID
========================================================= */
export const getMenuById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return badRequest(res, "ID inválido");
    }

    const menu = await populateMenu(
      Menu.findById(req.params.id)
    ).lean();

    if (!menu) {
      return notFound(res, "Menú no encontrado");
    }

    return ok(res, menu);
  } catch (error) {
    next(error);
  }
};