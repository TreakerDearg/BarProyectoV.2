import api from "../../../services/api";
import type { InventoryItem } from "../types/inventory";

/* =========================
   NORMALIZER (SAFE + CLEAN)
========================= */
const normalizeItem = (item: InventoryItem) => {
  return {
    name: item.name?.trim() || "",
    description: item.description?.trim() || "",

    stock: Number(item.stock ?? 0),
    minStock: Number(item.minStock ?? 5),
    maxStock: Number(item.maxStock ?? 100),

    unit: item.unit ?? "unit",
    sector: item.sector ?? "general",

    category: item.category?.trim().toLowerCase() || "",


    cost: Number(item.cost ?? 0),

    supplier: item.supplier?.trim() || "",
    location: item.location ?? "storage",
  };
};

/* =========================
   GET INVENTORY
========================= */
export const getInventory = async (): Promise<InventoryItem[]> => {
  const { data } = await api.get("/inventory");

  // backend: { data, total, page }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

/* =========================
   CREATE
========================= */
export const createInventoryItem = async (
  item: InventoryItem
): Promise<InventoryItem> => {
  const payload = normalizeItem(item);

  // VALIDACIÓN FRONT GUARD (evita 500 innecesarios)
  if (!payload.name || !payload.category) {
    throw new Error("Nombre y categoría son obligatorios");
  }

  const { data } = await api.post("/inventory", payload);

  return data;
};

/* =========================
   UPDATE
========================= */
export const updateInventoryItem = async (
  id: string,
  item: InventoryItem
): Promise<InventoryItem> => {
  const payload = normalizeItem(item);

  const { data } = await api.patch(`/inventory/${id}`, payload);

  return data;
};

/* =========================
   DELETE
========================= */
export const deleteInventoryItem = async (
  id: string
): Promise<void> => {
  await api.delete(`/inventory/${id}`);
};