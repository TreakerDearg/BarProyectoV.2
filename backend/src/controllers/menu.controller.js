import mongoose from "mongoose";
import Menu from "../models/Menu.js";
import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import Product from "../models/Product.js";
import { logger } from "../config/logger.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import {
  ok,
  created,
  badRequest,
  notFound,
} from "../utils/response.js";
import { emitMenuEvent, MENU_EVENTS } from "../utils/socketEvents.js";

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
    allowEmptyCategories = false,
  } = body;

  // 🔥 FORMATO AVANZADO (ya estructurado de la nueva MenuForm)
  if (categories && Array.isArray(categories)) {
    return {
      name,
      description,
      type,
      active,
      categories,
      allowEmptyCategories,
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
      allowEmptyCategories: false,
    };
  }

  return { ...body, allowEmptyCategories: body.allowEmptyCategories || false };
};

/* =========================================================
   VALIDATION
========================================================= */
const validateMenu = async (data) => {
  if (!data.name || !data.name.trim()) {
    return "El nombre es obligatorio";
  }

  if (!data.categories || !Array.isArray(data.categories)) {
    return "categories debe ser un array";
  }

  // Si allowEmptyCategories es true, permitir categorías vacías
  const allowEmpty = data.allowEmptyCategories === true;

  // Si no se permiten categorías vacías y no hay categorías, error
  if (!allowEmpty && data.categories.length === 0) {
    return "Debe tener al menos una categoría";
  }

  for (const cat of data.categories) {
    if (!cat.products || !Array.isArray(cat.products)) {
      return "Cada categoría debe tener productos";
    }

    // Si la categoría tiene productos, validarlos
    if (cat.products.length > 0) {
      for (const p of cat.products) {
        if (!isValidId(p.product)) {
          return "Producto inválido";
        }

        // Validación cruzada: verificar que el producto exista
        const product = await Product.findById(p.product);
        if (!product) {
          return `Producto con ID ${p.product} no encontrado`;
        }

        // Validación cruzada opcional: si el producto tiene receta, verificar que exista (warning, no error)
        if (product.hasRecipe) {
          const recipe = await Recipe.findOne({ product: p.product });
          if (!recipe) {
            logger.warn(`[Menu] El producto ${product.name} tiene hasRecipe=true pero no tiene receta asociada`);
          }
        }
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
    const { type, active, drinkStyle, featured, tags, dietaryRestrictions, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (active !== undefined) filter.active = active === "true";
    if (drinkStyle) filter.drinkStyle = drinkStyle;
    if (featured !== undefined) filter.featured = featured === "true";
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (dietaryRestrictions) filter.dietaryRestrictions = { $in: Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [dietaryRestrictions] };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [menus, total] = await Promise.all([
      populateMenu(
        Menu.find(filter)
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

/* =========================================================
   CREATE
========================================================= */
export const createMenu = async (req, res, next) => {
  try {
    //  NORMALIZACIÓN
    const normalized = normalizeMenuPayload(req.body);

    //  VALIDACIÓN
    const errorMsg = await validateMenu(normalized);
    if (errorMsg) return badRequest(res, errorMsg);

    // Procesar imagen: puede venir de multer (req.file) o del frontend (req.body)
    if (req.file) {
      // Imagen subida directamente via multer
      normalized.image = req.file.secure_url || req.file.path;
      normalized.imagePublicId = req.file.public_id;
      logger.info(`[Menu] Imagen subida via multer: ${normalized.imagePublicId}`);
    } else if (req.body.image) {
      // Imagen enviada desde frontend (ya subida a Cloudinary)
      normalized.image = req.body.image;
      // Validación de consistencia: si la imagen cambia, se requiere publicId
      if (req.body.imagePublicId !== undefined) {
        normalized.imagePublicId = req.body.imagePublicId;
      } else {
        // Si no se envía publicId, verificar si es una imagen existente
        const existingMenu = await Menu.findOne({ name: normalized.name });
        if (existingMenu && existingMenu.image === req.body.image) {
          normalized.imagePublicId = existingMenu.imagePublicId;
        } else {
          // Nuevo menú con imagen sin publicId - permitir para compatibilidad
          normalized.imagePublicId = "";
        }
      }
      logger.info(`[Menu] Imagen desde frontend: ${normalized.imagePublicId || 'sin publicId'}`);
    }

    const menu = await Menu.create(normalized);

    const populated = await populateMenu(
      Menu.findById(menu._id)
    ).lean();

    logger.info(`[Menu] Creado: ${menu.name}`);

    emitMenuEvent(MENU_EVENTS.CREATED, populated);

    return created(res, populated, "Menú creado correctamente");
  } catch (error) {
    logger.error("[Menu] Error creando menú:", error);
    throw error;
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

    const errorMsg = await validateMenu(normalized);
    if (errorMsg) return badRequest(res, errorMsg);

    // Procesar imagen: puede venir de multer (req.file) o del frontend (req.body)
    if (req.file) {
      // Imagen subida directamente via multer
      try {
        const existingMenu = await Menu.findById(req.params.id);
        
        // Eliminar imagen anterior si existe
        if (existingMenu?.imagePublicId) {
          await deleteImage(existingMenu.imagePublicId);
          logger.info(`[Menu] Imagen anterior eliminada: ${existingMenu.imagePublicId}`);
        }
        
        normalized.image = req.file.secure_url || req.file.path;
        normalized.imagePublicId = req.file.public_id;
        logger.info(`[Menu] Imagen subida via multer: ${normalized.imagePublicId}`);
      } catch (uploadError) {
        logger.error("[Menu] Error actualizando imagen via multer:", uploadError);
      }
    } else if (req.body.image !== undefined) {
      // Imagen enviada desde frontend (ya subida a Cloudinary)
      try {
        const existingMenu = await Menu.findById(req.params.id);
        
        // Solo requerir imagePublicId si la imagen está cambiando a una nueva URL
        if (req.body.image && req.body.image !== existingMenu?.image && !req.body.imagePublicId) {
          return badRequest(res, "Se requiere imagePublicId cuando se cambia la imagen");
        }
        
        // Si se envía imagePublicId pero no image, es un error
        if (req.body.imagePublicId && !req.body.image) {
          return badRequest(res, "Se requiere image URL cuando se proporciona imagePublicId");
        }
        
        // Si la imagen cambió y existe una imagen anterior, eliminarla de Cloudinary
        if (existingMenu?.imagePublicId && req.body.imagePublicId && req.body.imagePublicId !== existingMenu.imagePublicId) {
          await deleteImage(existingMenu.imagePublicId);
          logger.info(`[Menu] Imagen anterior eliminada: ${existingMenu.imagePublicId}`);
        }

        normalized.image = req.body.image;
        if (req.body.imagePublicId !== undefined) {
          normalized.imagePublicId = req.body.imagePublicId;
        } else if (existingMenu?.image === req.body.image) {
          // Mantener el publicId existente si la imagen no cambió
          normalized.imagePublicId = existingMenu.imagePublicId;
        }
        logger.info(`[Menu] Imagen actualizada desde frontend: ${normalized.imagePublicId || 'sin publicId'}`);
      } catch (uploadError) {
        logger.error("[Menu] Error actualizando imagen:", uploadError);
        logger.error("[Menu] Detalles del error:", {
          message: uploadError.message,
          stack: uploadError.stack,
        });
      }
    }

    const updated = await populateMenu(
      Menu.findByIdAndUpdate(req.params.id, normalized, {
        new: true,
        runValidators: true,
      })
    ).lean();

    if (!updated) return notFound(res, "Menú no encontrado");

    logger.info(`[Menu] Actualizado: ${updated.name}`);

    emitMenuEvent(MENU_EVENTS.UPDATED, updated);

    return ok(res, updated, "Menú actualizado correctamente");
  } catch (error) {
    logger.error("[Menu] Error actualizando menú:", error);
    throw error;
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

    // Eliminar imagen de Cloudinary si existe
    if (deleted.imagePublicId) {
      try {
        await deleteImage(deleted.imagePublicId);
      } catch (deleteError) {
        logger.error(`[Menu] Error eliminando imagen: ${deleteError.message}`);
        // Continuar aunque falle la eliminación de la imagen
      }
    }

    logger.info(`[Menu] Eliminado: ${deleted.name}`);

    emitMenuEvent(MENU_EVENTS.DELETED, { id: deleted._id });

    return ok(res, null, "Menú eliminado correctamente");
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   GET PUBLIC MENU (OPTIMIZADO PRO)
========================================================= */
export const getPublicMenu = async (req, res, next) => {
  try {
    const { type, hideUnavailable = "false", featured, tags, page = 1, limit = 20 } = req.query;

    const filter = { active: true, isPublic: true };
    if (type) filter.type = type;
    if (featured !== undefined) filter.featured = featured === "true";
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [menus, total] = await Promise.all([
      populateMenu(
        Menu.find(filter)
          .sort({ featured: -1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
      ),
      Menu.countDocuments(filter)
    ]);

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

          // Calculate missing ingredients if not available
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

        if (hideUnavailable === "true") {
          products = products.filter((p) => p.available);
        }

        return { ...cat, products };
      });

      return m;
    });

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
    throw error;
  }
};

/* =========================================================
   GET MENU BY SLUG (PUBLIC)
========================================================= */
export const getMenuBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return badRequest(res, "Slug es requerido");
    }

    const menu = await populateMenu(
      Menu.findOne({ slug, active: true, isPublic: true })
    ).lean();

    if (!menu) {
      return notFound(res, "Menú no encontrado");
    }

    return ok(res, menu);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   GET FEATURED MENUS
========================================================= */
export const getFeaturedMenus = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;

    const menus = await populateMenu(
      Menu.find({ active: true, isPublic: true, featured: true })
        .sort({ featured: -1, createdAt: -1 })
        .limit(parseInt(limit))
    ).lean();

    return ok(res, menus);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   SEARCH MENUS
========================================================= */
export const searchMenus = async (req, res, next) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;

    if (!q) {
      return badRequest(res, "Query es requerido");
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
      populateMenu(
        Menu.find(filter)
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