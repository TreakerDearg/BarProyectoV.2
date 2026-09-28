import { api } from "./client";
import type { ApiResponse, MenuPublicDTO, ProductPublicDTO } from "../types/api";

export async function getPublicMenus(): Promise<MenuPublicDTO[]> {
  const res = await api.get<ApiResponse<MenuPublicDTO[]>>("/menus/public");
  return res.data.data;
}

export async function getPublicProducts(params?: {
  category?: string;
  featured?: boolean;
}): Promise<ProductPublicDTO[]> {
  const res = await api.get<ApiResponse<ProductPublicDTO[]>>("/products/public", { params });
  return res.data.data;
}

export async function getProductById(id: string): Promise<ProductPublicDTO> {
  const res = await api.get<ApiResponse<ProductPublicDTO>>(`/products/${id}`);
  return res.data.data;
}
