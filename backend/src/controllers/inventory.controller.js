import mongoose from "mongoose";
import InventoryItem from "../models/InventoryItem.js";
import { logger } from "../config/logger.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import {
  ok, created, badRequest, notFound,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   GET ALL (filtros + paginación)
========================================================= */
export const getInventory = async (req, res, next) => {
  try {
    const {
      category, search, sector, location, lowStock, isActive,
      page = 1, limit = 50,
    } = req.query;

    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (sector   && sector   !== "all") filter.sector   = sector;
    if (location && location !== "all") filter.location = location;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search)  filter.$text = { $search: search };
    if (lowStock === "true") filter.$expr = { $lte: ["$stock", "$minStock"] };

    const skip  = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      InventoryItem.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)).lean(),
      InventoryItem.countDocuments(filter),
    ]);

    return ok(res, items, "OK", {
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) { next(error); }
};

/* =========================================================
   GET ONE
========================================================= */
export const getInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const item = await InventoryItem.findById(id).lean();
    if (!item) return notFound(res, "Item no encontrado");

    return ok(res, item);
  } catch (error) { next(error); }
};

/* =========================================================
   CREATE
========================================================= */
export const createInventoryItem = async (req, res, next) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return badRequest(res, "name y category son obligatorios");
    }

    // Procesar imagen si se proporciona (ya subida por multer-storage-cloudinary)
    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      imageUrl = req.file.secure_url || req.file.path;
      imagePublicId = req.file.public_id;
      logger.info(`[Inventory] Imagen subida a Cloudinary: ${imagePublicId}`);
    }

    const item = await InventoryItem.create({
      ...req.body,
      name:     req.body.name.trim(),
      category: req.body.category.trim().toLowerCase(),
      image:    imageUrl,
      imagePublicId: imagePublicId,
    });

    logger.info(`[Inventory] Creado: ${item.name}`);
    return created(res, item, "Item creado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   UPDATE
========================================================= */
export const updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const ALLOWED = [
      "name", "description", "stock", "minStock", "maxStock",
      "unit", "cost", "supplier", "sector", "category", "location", "isActive",
      "image", "imagePublicId",
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    if (updates.category) updates.category = updates.category.toLowerCase();

    // Manejar actualización de imagen (ya subida por multer-storage-cloudinary)
    if (req.file) {
      try {
        // Eliminar imagen anterior si existe
        const existingItem = await InventoryItem.findById(id);
        if (existingItem?.imagePublicId) {
          await deleteImage(existingItem.imagePublicId);
          logger.info(`[Inventory] Imagen anterior eliminada: ${existingItem.imagePublicId}`);
        }

        // Usar la nueva imagen ya subida por multer-storage-cloudinary
        updates.image = req.file.secure_url || req.file.path;
        updates.imagePublicId = req.file.public_id;
        logger.info(`[Inventory] Nueva imagen subida a Cloudinary: ${req.file.public_id}`);
      } catch (uploadError) {
        logger.error("[Inventory] Error actualizando imagen:", uploadError);
        // Continuar sin actualizar imagen si falla
      }
    }

    const updated = await InventoryItem.findByIdAndUpdate(
      id, updates, { new: true, runValidators: true }
    ).lean();

    if (!updated) return notFound(res, "Item no encontrado");

    logger.info(`[Inventory] Actualizado: ${updated.name}`);
    return ok(res, updated, "Item actualizado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   DELETE
========================================================= */
export const deleteInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const deleted = await InventoryItem.findByIdAndDelete(id);
    if (!deleted) return notFound(res, "Item no encontrado");

    // Eliminar imagen de Cloudinary si existe
    if (deleted.imagePublicId) {
      try {
        await deleteImage(deleted.imagePublicId);
      } catch (deleteError) {
        logger.error(`[Inventory] Error eliminando imagen: ${deleteError.message}`);
        // Continuar aunque falle la eliminación de la imagen
      }
    }

    logger.info(`[Inventory] Eliminado: ${deleted.name}`);
    return ok(res, null, "Item eliminado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   ADJUST STOCK
========================================================= */
export const adjustStock = async (req, res, next) => {
  try {
    const { id }           = req.params;
    const { amount, type, reason } = req.body;

    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return badRequest(res, "amount debe ser un número positivo");
    }

    if (!["add", "subtract"].includes(type)) {
      return badRequest(res, "type debe ser 'add' o 'subtract'");
    }

    const item = await InventoryItem.findById(id);
    if (!item) return notFound(res, "Item no encontrado");

    const prevStock = item.stock;

    if (type === "add")      item.stock += parsedAmount;
    if (type === "subtract") item.stock -= parsedAmount;

    if (item.stock < 0) {
      return badRequest(res, `Stock insuficiente. Disponible: ${prevStock}`);
    }

    /* Registrar movimiento en el historial */
    item.movements.push({
      type:          type === "add" ? "in" : "out",
      quantity:      parsedAmount,
      reason:        reason || "",
      costAtMoment:  item.cost,
    });

    await item.save();

    logger.info(`[Inventory] Stock ajustado: ${item.name} (${prevStock} → ${item.stock})`);
    return ok(res, item, `Stock ${type === "add" ? "aumentado" : "reducido"} correctamente`);
  } catch (error) { next(error); }
};

/* =========================================================
   GET CATEGORIES
========================================================= */
export const getInventoryCategories = async (req, res, next) => {
  try {
    const categories = await InventoryItem.distinct("category");
    return ok(res, categories.sort((a, b) => a.localeCompare(b)));
  } catch (error) { next(error); }
};

/* =========================================================
   STATS
========================================================= */
export const getInventoryStats = async (req, res, next) => {
  try {
    const [totalItems, stockData, lowStockItems, outOfStockItems, categories] = await Promise.all([
      InventoryItem.countDocuments(),
      InventoryItem.aggregate([{
        $group: { _id: null, totalStock: { $sum: "$stock" }, averageStock: { $avg: "$stock" } },
      }]),
      InventoryItem.countDocuments({ $expr: { $lte: ["$stock", "$minStock"] } }),
      InventoryItem.countDocuments({ stock: { $lte: 0 } }),
      InventoryItem.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { name: "$_id", value: "$count", _id: 0 } },
        { $sort: { value: -1 } },
      ]),
    ]);

    return ok(res, {
      totalItems,
      totalStock:    stockData[0]?.totalStock   || 0,
      averageStock:  Math.round(stockData[0]?.averageStock || 0),
      lowStockItems,
      outOfStockItems,
      categories,
    });
  } catch (error) { next(error); }
};