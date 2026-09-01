import api from "../../../services/api";
import type { Product } from "../../../types/product";

// ── Tipos de categoría ────────────────────────────────────────────

export interface ProductCategory {
  id: string;
  name: string;
  count: number;
  available: number;
  featured: number;
  drinks: number;
  food: number;
  sampleImage: string | null;
}

// ── Error extractor ───────────────────────────────────────────────

const extractError = (error: any): string =>
  String(
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Unexpected error"
  );

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Construye un FormData con los campos del producto.
 * Si se provee un File en `imageFile`, lo adjunta como campo `image`.
 * Si se proveen Files en `galleryFiles`, los adjunta como campo `gallery`.
 * Los campos JSON complejos (arrays) se serializan como strings.
 */
function buildProductFormData(
  product: Product,
  imageFile?: File | null,
  galleryFiles?: File[]
): FormData {
  const fd = new FormData();

  // Campos de texto
  if (product.name)         fd.append("name",            product.name.trim());
  if (product.description)  fd.append("description",     product.description);
  if (product.category)     fd.append("category",        product.category.trim().toLowerCase());
  if (product.subcategory)  fd.append("subcategory",     product.subcategory?.trim().toLowerCase() ?? "");
  if (product.type)         fd.append("type",            product.type);
  if (product.drinkStyle)   fd.append("drinkStyle",      product.drinkStyle);

  fd.append("price",           String(product.price ?? 0));
  fd.append("cost",            String(product.cost ?? 0));
  fd.append("available",       String(product.available ?? true));
  fd.append("featured",        String(product.featured ?? false));
  fd.append("preparationTime", String(product.preparationTime ?? 5));

  // Arrays → JSON string para que el backend los parsee correctamente
  if (Array.isArray(product.tags) && product.tags.length > 0) {
    // multer no puede parsear arrays directamente; los enviamos como múltiples campos
    product.tags.forEach((t) => fd.append("tags", t));
  }
  if (Array.isArray(product.dietaryRestrictions) && product.dietaryRestrictions.length > 0) {
    product.dietaryRestrictions.forEach((d) => fd.append("dietaryRestrictions", d));
  }

  // Imagen principal: si hay un File nuevo, adjuntarlo.
  // Si ya tiene URL de Cloudinary (sin cambios), enviarla como campo.
  if (imageFile instanceof File) {
    fd.append("image", imageFile);
  } else if (product.image && product.image.includes("cloudinary.com")) {
    fd.append("image",         product.image);
    if ((product as any).imagePublicId) {
      fd.append("imagePublicId", (product as any).imagePublicId);
    }
  }

  // Galería
  if (galleryFiles && galleryFiles.length > 0) {
    galleryFiles.forEach((f) => fd.append("gallery", f));
  }

  return fd;
}

// ── API calls ─────────────────────────────────────────────────────

/**
 * Lista todos los productos (admin).
 */
export const getProducts = async (): Promise<Product[]> => {
  const data = await api.get("/products");
  const list = (data as any)?.data ?? data;
  return Array.isArray(list) ? list : [];
};

/**
 * Bebidas (para variantes / ruleta).
 */
export const getBeverageProducts = async (params?: { category?: string }): Promise<Product[]> => {
  const qs = params?.category ? `?category=${params.category}` : "";
  const data = await api.get(`/products/beverages${qs}`);
  const list = (data as any)?.data ?? data;
  return Array.isArray(list) ? list : [];
};

/**
 * Categorías únicas con estadísticas.
 */
export const getCategories = async (params?: {
  type?: "drink" | "food";
  activeOnly?: boolean;
}): Promise<ProductCategory[]> => {
  const qs = new URLSearchParams();
  if (params?.type)       qs.set("type",       params.type);
  if (params?.activeOnly) qs.set("activeOnly",  "true");
  const data = await api.get(`/products/categories?${qs.toString()}`);
  const list = (data as any)?.data ?? data;
  return Array.isArray(list) ? list : [];
};

/**
 * Crea un producto con soporte real de imagen.
 * Acepta un `File` como `imageFile` para subir a Cloudinary vía multipart.
 */
export const createProduct = async (
  product: Product,
  imageFile?: File | null,
  galleryFiles?: File[]
): Promise<Product> => {
  try {
    const fd = buildProductFormData(product, imageFile, galleryFiles);

    // El interceptor de Axios del desktop NO debe serializar FormData como JSON
    const data = await api.post("/products", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return ((data as any)?.data ?? data) as Product;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/**
 * Actualiza un producto. Si `imageFile` es un File, reemplaza la imagen en Cloudinary.
 */
export const updateProduct = async (
  id: string,
  product: Product,
  imageFile?: File | null,
  galleryFiles?: File[]
): Promise<Product> => {
  try {
    const fd = buildProductFormData(product, imageFile, galleryFiles);

    const data = await api.put(`/products/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return ((data as any)?.data ?? data) as Product;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/**
 * Elimina un producto (y sus imágenes de Cloudinary vía backend).
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/**
 * Toggle disponibilidad.
 */
export const toggleAvailability = async (id: string): Promise<Product> => {
  try {
    const data = await api.patch(`/products/${id}/toggle-availability`);
    return ((data as any)?.data ?? data) as Product;
  } catch (error) {
    throw new Error(extractError(error));
  }
};
