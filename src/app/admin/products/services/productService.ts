import { api } from "@/lib/api/client";
import type { Product } from "@/lib/types/product";

const extractError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  const err = error as Record<string, unknown>;
  return (
    String(err?.response?.data?.message) ||
    String(err?.response?.data?.error) ||
    String(err?.message) ||
    "Unexpected error"
  );
};

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
    : product.tags?.split(",") || [],

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
    const payload = normalizeProduct(product);
    const { data } = await api.patch(`/products/${id}`, payload);
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

