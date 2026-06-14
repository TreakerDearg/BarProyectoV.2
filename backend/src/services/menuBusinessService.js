import mongoose from "mongoose";
import Menu from "../models/Menu.js";
import Recipe from "../models/Recipe.js";
import Product from "../models/Product.js";
import { logger } from "../config/logger.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   MENU BUSINESS SERVICE
   Centralized business logic for menu operations
========================================================= */

/**
 * Populate menu with product details
 */
export const populateMenu = (q) =>
  q.populate({
    path: "categories.products.product",
    select: "name price image available",
  });

/**
 * Normalize menu payload to support both advanced and legacy formats
 */
export const normalizeMenuPayload = (body) => {
  const {
    name,
    description = "",
    type = "mixed",
    active = true,
    categories,
    allowEmptyCategories = false,
  } = body;

  // Advanced format (already structured from new MenuForm)
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

  // Legacy format (simple frontend)
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

/**
 * Validate menu data
 */
export const validateMenu = async (data) => {
  if (!data.name || !data.name.trim()) {
    return "El nombre es obligatorio";
  }

  if (!data.categories || !Array.isArray(data.categories)) {
    return "categories debe ser un array";
  }

  // If allowEmptyCategories is true, allow empty categories
  const allowEmpty = data.allowEmptyCategories === true;

  // If empty categories are not allowed and there are no categories, error
  if (!allowEmpty && data.categories.length === 0) {
    return "Debe tener al menos una categoría";
  }

  for (const cat of data.categories) {
    if (!cat.products || !Array.isArray(cat.products)) {
      return "Cada categoría debe tener productos";
    }

    if (cat.products.length > 0) {
      for (const p of cat.products) {
        if (!isValidId(p.product)) {
          return "Producto inválido";
        }

        const product = await Product.findById(p.product);
        if (!product) {
          return `Producto con ID ${p.product} no encontrado`;
        }

        // Warn if product has hasRecipe=true but no associated recipe
        if (product.hasRecipe) {
          const recipe = await Recipe.findOne({ product: p.product });
          if (!recipe) {
            logger.warn(
              `[MenuBusinessService] El producto ${product.name} tiene hasRecipe=true pero no tiene receta asociada`
            );
          }
        }
      }
    }
  }

  return null;
};

/**
 * Calculate menu price range based on products
 */
export const calculateMenuPriceRange = (menu) => {
  if (!menu.categories || menu.categories.length === 0) {
    return { minPrice: 0, maxPrice: 0 };
  }

  let minPrice = Infinity;
  let maxPrice = 0;

  for (const category of menu.categories) {
    for (const product of category.products) {
      const price = product.price || 0;
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
    }
  }

  return {
    minPrice: minPrice === Infinity ? 0 : minPrice,
    maxPrice,
  };
};

/**
 * Determine drink style based on menu type and products
 */
export const determineDrinkStyle = (menu) => {
  if (menu.type === "food") return "classic";
  if (menu.type === "drink") {
    // Check if menu has mixed drinks (products with both alcoholic and non-alcoholic)
    const hasMixed = menu.categories?.some(cat =>
      cat.products?.some(p => p.product?.type === "mixed")
    );
    return hasMixed ? "mixed" : "classic";
  }
  return "mixed";
};

/**
 * Generate slug from menu name
 */
export const generateSlug = (name) =>
  name
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "") || "";

/**
 * Validate image file before upload
 */
export const validateImageFile = (file) => {
  if (!file) return { isValid: false, error: "No se proporcionó archivo" };

  // Check file type
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return { isValid: false, error: "Solo se permiten archivos de imagen" };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "El archivo no debe exceder 5MB" };
  }

  return { isValid: true };
};
