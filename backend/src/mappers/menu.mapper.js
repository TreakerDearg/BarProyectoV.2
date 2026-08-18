/**
 * Menu Mapper - Transforma MongoDB models a Public DTOs
 * Sigue el patrón establecido en recipe.dto.js
 */

import Menu from "../models/Menu.js";
import { toProductPublicDTO } from "./product.mapper.js";

/**
 * MenuPublicDTO - Contrato público para menús
 * Transforma _id → id y expone solo campos necesarios para el cliente
 */
export function toMenuPublicDTO(menu) {
  if (!menu) return null;

  return {
    id: menu._id?.toString() || "",
    name: menu.name || "",
    slug: menu.slug || "",
    description: menu.description || "",
    image: menu.image || "",
    type: menu.type || "mixed",
    drinkStyle: menu.drinkStyle || "mixed",
    featured: menu.featured || false,
    minPrice: menu.minPrice || 0,
    maxPrice: menu.maxPrice || 0,
    categories: (menu.categories || []).map(category => toMenuCategoryPublicDTO(category)),
  };
}

/**
 * MenuCategoryPublicDTO - Contrato público para categorías de menú
 */
export function toMenuCategoryPublicDTO(category) {
  if (!category) return null;

  return {
    id: category._id?.toString() || "",
    name: category.name || "",
    description: category.description || "",
    image: category.image || "",
    order: category.order || 0,
    products: (category.products || []).map(product => toMenuProductPublicDTO(product)),
  };
}

/**
 * MenuProductPublicDTO - Contrato público para productos dentro de menú
 */
export function toMenuProductPublicDTO(menuProduct) {
  if (!menuProduct) return null;

  return {
    product: menuProduct.product ? toProductPublicDTO(menuProduct.product) : null,
    price: menuProduct.price || null,
    available: menuProduct.available !== undefined ? menuProduct.available : true,
    featured: menuProduct.featured || false,
    order: menuProduct.order || 0,
  };
}

/**
 * MenuListPublicDTO - Para listas de menús (optimizado)
 */
export function toMenuListPublicDTO(menus) {
  if (!Array.isArray(menus)) return [];
  
  return menus.map(menu => toMenuPublicDTO(menu)).filter(Boolean);
}
