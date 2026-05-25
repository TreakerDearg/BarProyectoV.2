import mongoose from "mongoose";
import Product from "../models/Product.js";
import Recipe  from "../models/Recipe.js";
import Order   from "../models/Order.js";
import { logger } from "../config/logger.js";
import { uploadImage, deleteImage, uploadMultipleImages } from "../config/cloudinary.js";
import {
  ok, created, badRequest, notFound, conflict, serverError,
} from "../utils/response.js";
import { calculateProductPrice } from "../utils/pricingEngine.js";
import { emitProductEvent, PRODUCT_EVENTS } from "../utils/socketEvents.js";

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

    // Map dynamic prices
    const productsWithDynamicPrice = await Promise.all(products.map(async (p) => ({
      ...p,
      dynamicPrice: await calculateProductPrice(p)
    })));

    return ok(res, productsWithDynamicPrice);
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

    // Procesar imagen principal si se proporciona (ya subida por multer-storage-cloudinary)
    let imageUrl = null;
    let imagePublicId = null;

    if (req.files && req.files.image) {
      const imageFile = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
      imageUrl = imageFile.secure_url || imageFile.path;
      imagePublicId = imageFile.public_id;
      logger.info(`[Product] Imagen principal subida a Cloudinary: ${imagePublicId}`);
    }

    // Procesar galería de imágenes si se proporciona (ya subida por multer-storage-cloudinary)
    let galleryImages = [];
    let galleryPublicIds = [];

    if (req.files && req.files.gallery) {
      const galleryFiles = Array.isArray(req.files.gallery) ? req.files.gallery : [req.files.gallery];
      galleryImages = galleryFiles.map(f => f.secure_url || f.path);
      galleryPublicIds = galleryFiles.map(f => f.public_id);
      logger.info(`[Product] Galería de ${galleryFiles.length} imágenes subida a Cloudinary`);
    }

    const product = await Product.create({
      ...req.body,
      image: imageUrl,
      imagePublicId: imagePublicId,
      gallery: galleryImages,
      galleryPublicIds: galleryPublicIds,
    });
    
    // 🔥 Verificamos si ya existe una receta para marcar hasRecipe
    const recipe = await Recipe.findOne({ product: product._id });
    if (recipe) {
      product.hasRecipe = true;
      product.cost = recipe.totalCost || 0;
      await product.save();
    }

    logger.info(`[Product] Creado: ${product.name}`);

    emitProductEvent(PRODUCT_EVENTS.CREATED, product);

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
      "type", "available", "isActiveForPOS", "image", "imagePublicId",
      "gallery", "galleryPublicIds", "featured",
      "tags", "preparationTime", "hasRecipe", "isAlcohol", "stockImpact",
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    if (Object.keys(updates).length === 0) {
      return badRequest(res, "No hay campos válidos para actualizar");
    }

    // Manejar actualización de imagen principal (ya subida por multer-storage-cloudinary)
    if (req.files && req.files.image) {
      try {
        const existingProduct = await Product.findById(req.params.id);
        if (existingProduct?.imagePublicId) {
          await deleteImage(existingProduct.imagePublicId);
          logger.info(`[Product] Imagen principal anterior eliminada: ${existingProduct.imagePublicId}`);
        }

        const imageFile = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
        updates.image = imageFile.secure_url || imageFile.path;
        updates.imagePublicId = imageFile.public_id;
        logger.info(`[Product] Nueva imagen principal subida a Cloudinary: ${imageFile.public_id}`);
      } catch (uploadError) {
        logger.error("[Product] Error actualizando imagen principal:", uploadError);
        // Continuar sin actualizar imagen si falla
      }
    }

    // Manejar actualización de galería (ya subida por multer-storage-cloudinary)
    if (req.files && req.files.gallery) {
      try {
        const existingProduct = await Product.findById(req.params.id);

        // Eliminar imágenes anteriores de la galería
        if (existingProduct?.galleryPublicIds?.length > 0) {
          for (const publicId of existingProduct.galleryPublicIds) {
            try {
              await deleteImage(publicId);
            } catch (deleteError) {
              logger.error(`[Product] Error eliminando imagen de galería: ${deleteError.message}`);
            }
          }
        }

        const galleryFiles = Array.isArray(req.files.gallery) ? req.files.gallery : [req.files.gallery];
        updates.gallery = galleryFiles.map(f => f.secure_url || f.path);
        updates.galleryPublicIds = galleryFiles.map(f => f.public_id);
        logger.info(`[Product] Galería de ${galleryFiles.length} imágenes actualizada en Cloudinary`);
      } catch (uploadError) {
        logger.error("[Product] Error actualizando galería:", uploadError);
        // Continuar sin actualizar galería si falla
      }
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    ).lean();

    if (!updated) return notFound(res, "Producto no encontrado");

    logger.info(`[Product] Actualizado: ${updated.name}`);

    emitProductEvent(PRODUCT_EVENTS.UPDATED, updated);

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

    const relatedOrders = await Order.countDocuments({
      "items.product": product._id,
    });

    if (relatedOrders > 0) {
      product.available = false;
      product.isActiveForPOS = false;
      await product.save();

      logger.info(`[Product] Desactivado por referencias históricas: ${product.name}`);

      emitProductEvent(PRODUCT_EVENTS.UPDATED, product);
      emitProductEvent(PRODUCT_EVENTS.AVAILABILITY_CHANGED, { id: product._id, available: product.available });

      return ok(
        res,
        product,
        "Producto desactivado (tiene órdenes históricas relacionadas)"
      );
    }

    // Eliminar imágenes de Cloudinary antes de eliminar el producto
    if (product.imagePublicId) {
      try {
        await deleteImage(product.imagePublicId);
      } catch (deleteError) {
        logger.error(`[Product] Error eliminando imagen principal: ${deleteError.message}`);
      }
    }

    if (product.galleryPublicIds?.length > 0) {
      for (const publicId of product.galleryPublicIds) {
        try {
          await deleteImage(publicId);
        } catch (deleteError) {
          logger.error(`[Product] Error eliminando imagen de galería: ${deleteError.message}`);
        }
      }
    }

    await product.deleteOne();

    logger.info(`[Product] Eliminado: ${product.name}`);

    emitProductEvent(PRODUCT_EVENTS.DELETED, { id: product._id });

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

    emitProductEvent(PRODUCT_EVENTS.UPDATED, product);
    emitProductEvent(PRODUCT_EVENTS.AVAILABILITY_CHANGED, { id: product._id, available: product.available });

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

        emitProductEvent(PRODUCT_EVENTS.AVAILABILITY_CHANGED, { id: product._id, available });
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

/* =========================================================
   PRODUCTS WITH RECIPES
========================================================= */
export const getProductsWithRecipes = async (req, res, next) => {
  try {
    const { type, category, available } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === "true";

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    const productIds = products.map(p => p._id);
    const recipes = await Recipe.find({ product: { $in: productIds } })
      .populate("ingredients.inventoryItem", "name unit stock cost")
      .lean();

    const recipeMap = Object.fromEntries(
      recipes.map(r => [r.product.toString(), r])
    );

    const productsWithRecipes = products.map(p => ({
      ...p,
      recipe: recipeMap[p._id.toString()] || null
    }));

    return ok(res, productsWithRecipes);
  } catch (error) { next(error); }
};