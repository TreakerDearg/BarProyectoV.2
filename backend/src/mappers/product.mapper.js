/**
 * Product Mapper - Transforma MongoDB models a Public DTOs
 * Sigue el patrón establecido en recipe.dto.js
 */

import Product from "../models/Product.js";

/**
 * ProductPublicDTO - Contrato público para productos
 * Transforma _id → id y expone solo campos necesarios para el cliente
 * 
 * NOTA: dynamicPrice se calcula en el controller usando calculateProductPrice
 * Este mapper solo transforma campos existentes del modelo
 */
export function toProductPublicDTO(product, dynamicPrice = null) {
  if (!product) return null;

  return {
    id: product._id?.toString() || "",
    name: product.name || "",
    description: product.description || "",
    price: product.price || 0,
    dynamicPrice: dynamicPrice !== null ? dynamicPrice : product.price || 0,
    image: product.image || "",
    type: product.type || "drink",
    drinkStyle: product.drinkStyle || "classic",
    available: product.available !== undefined ? product.available : true,
    featured: product.featured || false,
    category: product.category || "",
    tags: product.tags || [],
    dietaryRestrictions: product.dietaryRestrictions || [],
  };
}

/**
 * ProductListPublicDTO - Para listas de productos (optimizado)
 */
export function toProductListPublicDTO(products, dynamicPrices = null) {
  if (!Array.isArray(products)) return [];
  
  const priceMap = dynamicPrices ? Object.fromEntries(
    products.map((p, i) => [p._id?.toString(), dynamicPrices[i]])
  ) : {};
  
  return products.map((product, index) => 
    toProductPublicDTO(product, priceMap[product._id?.toString()])
  ).filter(Boolean);
}
