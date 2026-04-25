import mongoose from "mongoose";
import Product from "../models/Product.js";
import Recipe  from "../models/Recipe.js";
import { logger } from "../config/logger.js";
import {
  ok, created, badRequest, notFound, conflict, serverError,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   GET ALL PRODUCTS
========================================================= */
export const getProducts = async (req, res, next) => {
  try {
    const { type, category, available, isActiveForPOS, search, tags, featured } = req.query;

    const filter = {};
    if (type)           filter.type           = type;
    if (category)       filter.category       = category;
    if (featured)       filter.featured       = featured === "true";
    if (isActiveForPOS) filter.isActiveForPOS = isActiveForPOS === "true";
    if (available !== undefined) filter.available = available === "true";
    if (tags)  filter.tags  = { $in: tags.split(",").map((t) => t.trim()) };
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    return ok(res, products);
  } catch (error) { next(error); }
};

/* =========================================================
   GET ONE
========================================================= */
export const getProduct = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return badRequest(res, "ID inválido");

    const product = await Product.findById(req.params.id).lean();
    if (!product) return notFound(res, "Producto no encontrado");

    return ok(res, product);
  } catch (error) { next(error); }
};

/* =========================================================
   CREATE
========================================================= */
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, type, category } = req.body;

    if (!name || price === undefined || !type || !category) {
      return badRequest(res, "name, price, type y category son obligatorios");
    }

    const exists = await Product.findOne({ name: name.trim().toLowerCase() });
    if (exists) return conflict(res, "El producto ya existe");

    const product = await Product.create(req.body);
    logger.info(`[Product] Creado: ${product.name}`);

    return created(res, product, "Producto creado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   UPDATE
========================================================= */
export const updateProduct = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return badRequest(res, "ID inválido");

    const ALLOWED = [
      "name", "description", "price", "cost", "category", "subcategory",
      "type", "available", "isActiveForPOS", "image", "featured",
      "tags", "preparationTime", "hasRecipe", "isAlcohol", "stockImpact",
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    if (Object.keys(updates).length === 0) {
      return badRequest(res, "No hay campos válidos para actualizar");
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    ).lean();

    if (!updated) return notFound(res, "Producto no encontrado");

    logger.info(`[Product] Actualizado: ${updated.name}`);
    return ok(res, updated, "Producto actualizado");
  } catch (error) { next(error); }
};

/* =========================================================
   DELETE
========================================================= */
export const deleteProduct = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return badRequest(res, "ID inválido");

    const product = await Product.findById(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");

    await product.deleteOne();
    logger.info(`[Product] Eliminado: ${product.name}`);

    return ok(res, null, "Producto eliminado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   TOGGLE AVAILABILITY
========================================================= */
export const toggleProductAvailability = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return badRequest(res, "ID inválido");

    const product = await Product.findById(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");

    product.available = !product.available;
    await product.save();

    return ok(res, product, `Producto ${product.available ? "activado" : "desactivado"}`);
  } catch (error) { next(error); }
};

/* =========================================================
   SYNC AVAILABILITY — verifica stock de ingredientes
========================================================= */
export const syncProductAvailability = async (req, res, next) => {
  try {
    const products = await Product.find({ hasRecipe: true });
    let updated = 0;

    for (const product of products) {
      const recipe = await Recipe.findOne({ product: product._id })
        .populate("ingredients.inventoryItem")
        .lean();

      if (!recipe) continue;

      const available = recipe.ingredients.every(
        (ing) => ing.inventoryItem && ing.inventoryItem.stock >= ing.quantity
      );

      if (product.available !== available) {
        product.available = available;
        await product.save();
        updated++;
      }
    }

    return ok(res, { updated }, `${updated} productos sincronizados`);
  } catch (error) { next(error); }
};

/* =========================================================
   STATS
========================================================= */
export const getProductStats = async (req, res, next) => {
  try {
    const [total, available, unavailable, byType, byCategory] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ available: true }),
      Product.countDocuments({ available: false }),
      Product.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    ]);

    return ok(res, { total, available, unavailable, byType, byCategory });
  } catch (error) { next(error); }
};