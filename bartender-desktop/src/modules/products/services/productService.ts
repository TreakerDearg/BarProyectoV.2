import api from "../../../services/api";
import type { Product } from "../../../types/product";

const extractError = (error: any): string => {
  return (
    String(error?.response?.data?.message || "") ||
    String(error?.response?.data?.error || "") ||
    String(error?.message || "") ||
    "Unexpected error"
  );
};

/* =========================
   IMAGE VALIDATION
========================= */
export function validateImageData(product: any): { valid: boolean; error?: string } {
  // Validate main image
  if (product.image && !product.imagePublicId) {
    return {
      valid: false,
      error: 'Se requiere imagePublicId cuando se proporciona una imagen principal'
    };
  }
  if (product.imagePublicId && !product.image) {
    return {
      valid: false,
      error: 'Se requiere image URL cuando se proporciona imagePublicId'
    };
  }
  if (product.image && !product.image.includes('cloudinary.com')) {
    return {
      valid: false,
      error: 'La URL de la imagen debe ser de Cloudinary'
    };
  }

  // Validate gallery images
  if (product.gallery && Array.isArray(product.gallery)) {
    if (product.galleryPublicIds && Array.isArray(product.galleryPublicIds)) {
      if (product.gallery.length !== product.galleryPublicIds.length) {
        return {
          valid: false,
          error: 'El número de imágenes de la galería debe coincidir con el número de publicIds'
        };
      }
    }
    
    for (const imageUrl of product.gallery) {
      if (imageUrl && !imageUrl.includes('cloudinary.com')) {
        return {
          valid: false,
          error: 'Las URLs de la galería deben ser de Cloudinary'
        };
      }
    }
  }

  return { valid: true };
}

/* =========================
   NORMALIZER
========================= */
const normalizeProduct = (product: Product) => ({
  name: product.name?.trim(),
  description: product.description || "",
  price: Number(product.price ?? 0),
  cost: Number(product.cost ?? 0),

  type: product.type,
  category: product.category?.trim().toLowerCase(),
  subcategory: product.subcategory?.trim().toLowerCase() || "",

  available: product.available ?? true,
  image: product.image || "",
  featured: product.featured ?? false,

  tags: Array.isArray(product.tags)
    ? product.tags
    : typeof product.tags === "string"
      ? (product.tags as string).split(",")
      : [],

  preparationTime: Number(product.preparationTime ?? 0),
});

/* =========================
   GET PRODUCTS
========================= */
export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/products");
  return Array.isArray(data) ? data : [];
};

/* =========================
   CREATE
========================= */
export const createProduct = async (
  product: Product
): Promise<Product> => {
  try {
    // Validate image data before sending
    const imageValidation = validateImageData(product);
    if (!imageValidation.valid) {
      throw new Error(imageValidation.error);
    }

    const payload = normalizeProduct(product);
    const { data } = await api.post("/products", payload);
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* =========================
   UPDATE
========================= */
export const updateProduct = async (
  id: string,
  product: Product
): Promise<Product> => {
  try {
    // Validate image data before sending
    const imageValidation = validateImageData(product);
    if (!imageValidation.valid) {
      throw new Error(imageValidation.error);
    }

    const payload = normalizeProduct(product);
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* =========================
   DELETE
========================= */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    throw new Error(extractError(error));
  }
};