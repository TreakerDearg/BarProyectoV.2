import api from "./api";
import type { Menu } from "../types/menu";
import { deleteImage as deleteImageFromCloudinary } from "./uploadService";

/* =========================
   RESPONSE NORMALIZER 
========================= */
function unwrap<T>(res: any): T {
  if (!res) return res;

  if (Array.isArray(res.data)) return res.data;
  if (res.data?.data) return res.data.data;

  return res.data;
}

/* =========================
   IMAGE VALIDATION
========================= */
export function validateImageData(menu: any): { valid: boolean; error?: string } {
  // If image URL is provided, publicId must also be provided
  if (menu.image && !menu.imagePublicId) {
    return {
      valid: false,
      error: 'Se requiere imagePublicId cuando se proporciona una imagen'
    };
  }

  // If publicId is provided, image URL must also be provided
  if (menu.imagePublicId && !menu.image) {
    return {
      valid: false,
      error: 'Se requiere image URL cuando se proporciona imagePublicId'
    };
  }

  // Validate Cloudinary URL format (basic check)
  if (menu.image && !menu.image.includes('cloudinary.com')) {
    return {
      valid: false,
      error: 'La URL de la imagen debe ser de Cloudinary'
    };
  }

  return { valid: true };
}

/* =========================
   GET ALL
========================= */
export const getMenus = async (): Promise<Menu[]> => {
  const res = await api.get("/menus");
  const data = unwrap<Menu[]>(res);

  return Array.isArray(data) ? data : [];
};

/* =========================
   GET ONE
========================= */
export const getMenuById = async (id: string): Promise<Menu> => {
  const res = await api.get(`/menus/${id}`);
  return unwrap<Menu>(res);
};

/* =========================
   CREATE
========================= */
export const createMenu = async (
  menu: any,
  options?: { allowEmptyCategories?: boolean }
): Promise<Menu> => {
  // Validate image data before sending
  const imageValidation = validateImageData(menu);
  if (!imageValidation.valid) {
    throw new Error(imageValidation.error);
  }

  const payload = buildPayload(menu, options?.allowEmptyCategories);

  const res = await api.post("/menus", payload);
  return unwrap<Menu>(res);
};

/* =========================
   UPDATE
========================= */
export const updateMenu = async (
  id: string,
  menu: any,
  options?: { allowEmptyCategories?: boolean }
): Promise<Menu> => {
  // Validate image data before sending
  const imageValidation = validateImageData(menu);
  if (!imageValidation.valid) {
    throw new Error(imageValidation.error);
  }

  const payload = buildPayload(menu, options?.allowEmptyCategories);

  const res = await api.put(`/menus/${id}`, payload);
  return unwrap<Menu>(res);
};

/* =========================
   DELETE
========================= */
export const deleteMenu = async (id: string): Promise<void> => {
  await api.delete(`/menus/${id}`);
};

function buildPayload(menu: any, allowEmptyCategories = false) {
  if (!menu) throw new Error("Datos inválidos");

  if (!menu.name?.trim()) {
    throw new Error("Nombre requerido");
  }

  // Si allowEmptyCategories es false, requerir al menos una categoría
  if (!allowEmptyCategories && (!Array.isArray(menu.categories) || menu.categories.length === 0)) {
    throw new Error("Debe tener al menos una categoría");
  }

  const categories = Array.isArray(menu.categories) ? menu.categories.map((cat: any, index: number) => {
    if (!cat.name) {
      throw new Error(`Categoría #${index + 1} sin nombre`);
    }

    if (!allowEmptyCategories && (!Array.isArray(cat.products) || cat.products.length === 0)) {
      throw new Error(`La categoría "${cat.name}" está vacía`);
    }

    const products = Array.isArray(cat.products) && cat.products.length > 0 ? cat.products.map((p: any, i: number) => {
      if (!p.product) {
        throw new Error(`Producto inválido en ${cat.name}`);
      }

      return {
        product: p.product,
        price: p.price ?? null, //  alineado con schema backend
        available: p.available ?? true,
        order: i, //  importante (no position)
      };
    }) : [];

    return {
      name: cat.name,
      description: cat.description || "",
      order: index,
      products,
    };
  }) : [];

  return {
    name: menu.name.trim(),
    description: menu.description?.trim() || "",
    active: menu.active ?? true,

    //  CLAVE PARA NO ROMPER
    type: menu.type || "mixed",

    isPublic: menu.isPublic ?? true,

    allowEmptyCategories,

    categories,

    // Cloudinary image fields
    image: menu.image || "",
    imagePublicId: menu.imagePublicId || "",

    // SEO fields
    metaTitle: menu.metaTitle || "",
    metaDescription: menu.metaDescription || "",
    keywords: menu.keywords || [],

    // Availability fields
    availableHours: menu.availableHours || null,
    availableDays: menu.availableDays || [],

    // Featured flag
    featured: menu.featured || false,

    // Gallery
    gallery: menu.gallery || [],

    // Tags
    tags: menu.tags || [],
  };
}