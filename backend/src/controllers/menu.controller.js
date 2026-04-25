import mongoose from "mongoose";
import Menu          from "../models/Menu.js";
import Recipe        from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import { logger }    from "../config/logger.js";
import {
  ok, created, badRequest, notFound,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateMenu = (q) => q.populate("categories.products.product");

/* =========================================================
   HELPER: CHECK AVAILABILITY
========================================================= */
const checkAvailability = (recipe, inventoryMap) => {
  if (!recipe) return false;
  return recipe.ingredients.every((ing) => {
    const item = inventoryMap[ing.inventoryItem?.toString()];
    return item && item.stock >= ing.quantity;
  });
};

/* =========================================================
   GET ALL MENUS (admin)
========================================================= */
export const getMenus = async (req, res, next) => {
  try {
    const { type, active } = req.query;
    const filter = {};
    if (type)             filter.type   = type;
    if (active !== undefined) filter.active = active === "true";

    const menus = await populateMenu(Menu.find(filter).sort({ createdAt: -1 })).lean();
    return ok(res, menus);
  } catch (error) { next(error); }
};

/* =========================================================
   GET PUBLIC MENU (con disponibilidad por inventario)
========================================================= */
export const getPublicMenu = async (req, res, next) => {
  try {
    const { type, hideUnavailable = "false" } = req.query;

    const filter = { active: true, isPublic: true };
    if (type) filter.type = type;

    const menus = await populateMenu(Menu.find(filter));

    /* Recolectar IDs de productos */
    const productIds = menus.flatMap((m) =>
      m.categories.flatMap((c) => c.products.map((p) => p.product?._id).filter(Boolean))
    );

    /* Traer recetas e inventario en paralelo */
    const recipes = await Recipe.find({ product: { $in: productIds } }).lean();
    const ingredientIds = recipes.flatMap((r) => r.ingredients.map((i) => i.inventoryItem));
    const inventoryItems = await InventoryItem.find({ _id: { $in: ingredientIds } }).lean();

    const recipeMap    = Object.fromEntries(recipes.map((r) => [r.product.toString(), r]));
    const inventoryMap = Object.fromEntries(inventoryItems.map((i) => [i._id.toString(), i]));

    const result = menus.map((menu) => {
      const m = menu.toObject();
      m.categories = m.categories.map((cat) => {
        let products = cat.products.map((p) => {
          const productId = p.product?._id?.toString();
          const available = p.available && checkAvailability(recipeMap[productId], inventoryMap);
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
  } catch (error) { next(error); }
};

/* =========================================================
   GET ONE
========================================================= */
export const getMenuById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return badRequest(res, "ID inválido");

    const menu = await populateMenu(Menu.findById(req.params.id)).lean();
    if (!menu) return notFound(res, "Menú no encontrado");

    return ok(res, menu);
  } catch (error) { next(error); }
};

/* =========================================================
   CREATE
========================================================= */
export const createMenu = async (req, res, next) => {
  try {
    const { name, categories } = req.body;

    if (!name) return badRequest(res, "name es obligatorio");
    if (categories && !Array.isArray(categories)) {
      return badRequest(res, "categories debe ser un array");
    }

    const menu = await Menu.create(req.body);
    const populated = await populateMenu(Menu.findById(menu._id)).lean();

    logger.info(`[Menu] Creado: ${name}`);
    return created(res, populated, "Menú creado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   UPDATE
========================================================= */
export const updateMenu = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return badRequest(res, "ID inválido");

    const ALLOWED = ["name", "description", "categories", "active", "type", "isPublic"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    const updated = await populateMenu(
      Menu.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    ).lean();

    if (!updated) return notFound(res, "Menú no encontrado");

    logger.info(`[Menu] Actualizado: ${updated.name}`);
    return ok(res, updated, "Menú actualizado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   DELETE
========================================================= */
export const deleteMenu = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return badRequest(res, "ID inválido");

    const deleted = await Menu.findByIdAndDelete(req.params.id);
    if (!deleted) return notFound(res, "Menú no encontrado");

    logger.info(`[Menu] Eliminado: ${deleted.name}`);
    return ok(res, null, "Menú eliminado correctamente");
  } catch (error) { next(error); }
};