import api from "../../../services/api";
import type { InventoryItem } from "../types/inventory";

/* =========================
   IMAGE VALIDATION
========================= */
export function validateImageData(item: any): { valid: boolean; error?: string } {
  // If image URL is provided, publicId must also be provided
  if (item.image && !item.imagePublicId) {
    return {
      valid: false,
      error: 'Se requiere imagePublicId cuando se proporciona una imagen'
    };
  }

  // If publicId is provided, image URL must also be provided
  if (item.imagePublicId && !item.image) {
    return {
      valid: false,
      error: 'Se requiere image URL cuando se proporciona imagePublicId'
    };
  }

  // Validate Cloudinary URL format (basic check)
  if (item.image && !item.image.includes('cloudinary.com')) {
    return {
      valid: false,
      error: 'La URL de la imagen debe ser de Cloudinary'
    };
  }

  return { valid: true };
}

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
  // Validate image data before sending
  const imageValidation = validateImageData(item);
  if (!imageValidation.valid) {
    throw new Error(imageValidation.error);
  }

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
  // Validate image data before sending
  const imageValidation = validateImageData(item);
  if (!imageValidation.valid) {
    throw new Error(imageValidation.error);
  }

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