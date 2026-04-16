import { api } from "../../../services/api";
import type { InventoryItem } from "../types/inventory";

export const getInventory = async (): Promise<InventoryItem[]> => {
  const { data } = await api.get("/inventory");
  return data;
};

export const createInventoryItem = async (
  item: InventoryItem
): Promise<InventoryItem> => {
  const { data } = await api.post("/inventory", item);
  return data;
};

export const updateInventoryItem = async (
  id: string,
  item: InventoryItem
): Promise<InventoryItem> => {
  const { data } = await api.put(`/inventory/${id}`, item);
  return data;
};

export const deleteInventoryItem = async (
  id: string
): Promise<void> => {
  await api.delete(`/inventory/${id}`);
};