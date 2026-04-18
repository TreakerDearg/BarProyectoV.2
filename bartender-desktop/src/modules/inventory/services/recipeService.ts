import api from "../../../services/api";
import type { InventoryItem } from "../types/inventory";

/* =========================
   GET
========================= */
export const getInventory = async (): Promise<InventoryItem[]> => {
  const { data } = await api.get("/inventory");
  return data.data; 
};

/* =========================
   CREATE
========================= */
export const createInventoryItem = async (item: InventoryItem) => {
  const payload = {
    name: item.name,
    stock: item.stock ?? 0,   
    unit: item.unit,
    category: item.category,
    minStock: item.minStock,
    maxStock: item.maxStock,
    cost: item.cost,
    sector: item.sector,
    supplier: item.supplier,
    location: item.location,
  };

  const { data } = await api.post("/inventory", payload);
  return data;
};

/* =========================
   UPDATE
========================= */
export const updateInventoryItem = async (
  id: string,
  item: InventoryItem
) => {
  const payload = {
    name: item.name,
    stock: item.stock,
    unit: item.unit,
    category: item.category,
    minStock: item.minStock,
    maxStock: item.maxStock,
    cost: item.cost,
    sector: item.sector,
    supplier: item.supplier,
    location: item.location,
  };

  const { data } = await api.patch(`/inventory/${id}`, payload);
  return data;
};

/* =========================
   DELETE
========================= */
export const deleteInventoryItem = async (id: string) => {
  await api.delete(`/inventory/${id}`);
};