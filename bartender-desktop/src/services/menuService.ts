import api from "./api";
import type { Menu } from "../types/menu";

/* =========================
   RESPONSE NORMALIZER 
========================= */
type MenuDraft = Menu & { imagePublicId?: string };
type MenuCategoryDraft = Menu["categories"][number];
type MenuProductDraft = MenuCategoryDraft["products"][number];
type ApiResponse = { data?: unknown };

function unwrap<T>(res: ApiResponse): T {
  const value = res?.data;
  if (Array.isArray(value)) return value as T;
  if (value && typeof value === "object" && "data" in value) {
    return (value as { data: unknown }).data as T;
  }
  return value as T;
}

/* =========================
   IMAGE VALIDATION
========================= */
export function validateImageData(menu: MenuDraft): { valid: boolean; error?: string } {
  // If image URL is provided, publicId is optional for compatibility
  // Allow empty string for imagePublicId
  if (menu.image && menu.imagePublicId === undefined) {
    // If imagePublicId is undefined, set it to empty string for compatibility
    menu.imagePublicId = "";
  }

  // If publicId is provided, image URL must also be provided
  if (menu.imagePublicId && !menu.image) {
    return {
      valid: false,
      error: 'Se requiere image URL cuando se proporciona imagePublicId'
    };
  }

  // Validate Cloudinary URL format (basic check) - optional for compatibility
  if (menu.image && !menu.image.includes('cloudinary.com')) {
    // Allow non-Cloudinary URLs for compatibility
    console.warn('[MenuService] Image URL is not from Cloudinary:', menu.image);
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
  menu: MenuDraft,
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
  menu: MenuDraft,
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

function buildPayload(menu: MenuDraft, allowEmptyCategories = false) {
  if (!menu) throw new Error("Datos inválidos");

  if (!menu.name?.trim()) {
    throw new Error("Nombre requerido");
  }

  // Si allowEmptyCategories es false, requerir al menos una categoría
  if (!allowEmptyCategories && (!Array.isArray(menu.categories) || menu.categories.length === 0)) {
    throw new Error("Debe tener al menos una categoría");
  }

  const categories = Array.isArray(menu.categories) ? menu.categories.map((cat: MenuCategoryDraft, index: number) => {
    if (!cat.name) {
      throw new Error(`Categoría #${index + 1} sin nombre`);
    }

    if (!allowEmptyCategories && (!Array.isArray(cat.products) || cat.products.length === 0)) {
      throw new Error(`La categoría "${cat.name}" está vacía`);
    }

    const products = Array.isArray(cat.products) && cat.products.length > 0 ? cat.products.map((p: MenuProductDraft, i: number) => {
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