import { api } from "../../../services/api";
import type { Product } from "../../../types/product";

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/products");
  return data;
};

export const createProduct = async (product: Product): Promise<Product> => {
  const { data } = await api.post("/products", product);
  return data;
};

export const updateProduct = async (
  id: string,
  product: Product
): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};