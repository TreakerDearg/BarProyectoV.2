import api from "../../../services/api";
import type { InventoryItem } from "../types/inventory";

// ── Tipos locales ─────────────────────────────────────────────────

export interface InventoryStats {
  totalItems:     number;
  totalStock:     number;
  averageStock:   number;
  lowStockItems:  number;
  outOfStockItems: number;
  categories: { name: string; value: number }[];
}

export interface InventoryMovement {
  type:         "in" | "out" | "adjustment" | "waste" | "transfer";
  quantity:     number;
  reason:       string;
  costAtMoment: number;
  createdAt:    string;
}

export interface InventoryCategory {
  name: string;
}

// ── Helper de unwrap ──────────────────────────────────────────────
// El interceptor de Axios del desktop devuelve response.data directamente.
// El backend envuelve en { success, data, message, meta? }.
function unwrap<T>(res: any): T {
  if (Array.isArray(res)) return res as T;
  // { success, data: T }
  if (res?.data !== undefined) {
    const inner = res.data;
    if (Array.isArray(inner)) return inner as T;
    return inner as T;
  }
  return (res ?? null) as T;
}

function unwrapList<T>(res: any): T[] {
  const val = unwrap<T[] | { items?: T[]; data?: T[] }>(res);
  if (Array.isArray(val)) return val;
  if (Array.isArray((val as any)?.items)) return (val as any).items;
  if (Array.isArray((val as any)?.data))  return (val as any).data;
  return [];
}

// ── LOCATION: mapeo frontend → backend ───────────────────────────
// Backend acepta SOLO "bar" | "kitchen" | "storage" (enum en Mongoose + Zod).
// Si el form usa labels en español, convertirlos aquí.
export const LOCATION_VALUES = [
  { value: "bar",     label: "Barra" },
  { value: "kitchen", label: "Cocina" },
  { value: "storage", label: "Bodega / Almacén" },
] as const;

export type LocationValue = "bar" | "kitchen" | "storage";

// ── Normalizer ────────────────────────────────────────────────────

function normalize(item: InventoryItem): Record<string, unknown> {
  // Asegurar que location sea uno de los valores permitidos por el backend
  const locationMap: Record<string, LocationValue> = {
    "Bóveda Central": "storage",
    "Barra Principal": "bar",
    "Bodega Externa": "storage",
    "Cocina VIP": "kitchen",
    bar: "bar",
    kitchen: "kitchen",
    storage: "storage",
  };
  const location: LocationValue =
    locationMap[item.location as string] ?? "storage";

  return {
    name:        item.name?.trim() ?? "",
    description: item.description?.trim() ?? "",
    stock:       Number(item.stock    ?? 0),
    minStock:    Number(item.minStock ?? 5),
    maxStock:    Number(item.maxStock ?? 100),
    unit:        item.unit   ?? "unit",
    sector:      item.sector ?? "general",
    category:    item.category?.trim().toLowerCase() ?? "",
    location,
    cost:        Number(item.cost ?? 0),
    supplier:    item.supplier?.trim() ?? "",
    isActive:    item.isActive !== false,
  };
}

// ── CRUD ──────────────────────────────────────────────────────────

export const getInventory = async (params?: {
  category?: string;
  sector?: string;
  location?: string;
  search?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}): Promise<InventoryItem[]> => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.sector)   qs.set("sector",   params.sector);
  if (params?.location) qs.set("location", params.location);
  if (params?.search)   qs.set("search",   params.search);
  if (params?.lowStock) qs.set("lowStock", "true");
  if (params?.page)     qs.set("page",     String(params.page));
  if (params?.limit)    qs.set("limit",    String(params.limit ?? 100));

  const res = await api.get(`/inventory?${qs.toString()}`);
  return unwrapList<InventoryItem>(res);
};

export const getInventoryItem = async (id: string): Promise<InventoryItem | null> => {
  const res = await api.get(`/inventory/${id}`);
  return unwrap<InventoryItem>(res);
};

export const getInventoryStats = async (): Promise<InventoryStats> => {
  const res = await api.get("/inventory/stats");
  return unwrap<InventoryStats>(res) ?? {
    totalItems: 0, totalStock: 0, averageStock: 0,
    lowStockItems: 0, outOfStockItems: 0, categories: [],
  };
};

export const getInventoryCategories = async (): Promise<string[]> => {
  const res = await api.get("/inventory/categories");
  const list = unwrap<string[]>(res);
  return Array.isArray(list) ? list : [];
};

export const getInventoryMovements = async (
  id: string
): Promise<InventoryMovement[]> => {
  const res = await api.get(`/inventory/${id}/movements`);
  const data = unwrap<{ movements: InventoryMovement[] }>(res);
  return Array.isArray((data as any)?.movements) ? (data as any).movements : [];
};

export const createInventoryItem = async (
  item: InventoryItem,
  imageFile?: File | null
): Promise<InventoryItem> => {
  if (!item.name || !item.category) {
    throw new Error("Nombre y categoría son obligatorios");
  }

  const payload = normalize(item);

  if (imageFile instanceof File) {
    // Subir vía multipart
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    fd.append("image", imageFile);
    const res = await api.post("/inventory", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap<InventoryItem>(res) as InventoryItem;
  }

  const res = await api.post("/inventory", payload);
  return unwrap<InventoryItem>(res) as InventoryItem;
};

export const updateInventoryItem = async (
  id: string,
  item: InventoryItem,
  imageFile?: File | null
): Promise<InventoryItem> => {
  const payload = normalize(item);

  if (imageFile instanceof File) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    fd.append("image", imageFile);
    const res = await api.patch(`/inventory/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap<InventoryItem>(res) as InventoryItem;
  }

  const res = await api.patch(`/inventory/${id}`, payload);
  return unwrap<InventoryItem>(res) as InventoryItem;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  await api.delete(`/inventory/${id}`);
};

/**
 * Ajusta el stock de un ítem.
 * Alineado con el backend: {amount, type:"add"|"subtract", reason}
 */
export const adjustStock = async (
  id: string,
  amount: number,
  type: "add" | "subtract",
  reason: string = ""
): Promise<InventoryItem> => {
  if (amount <= 0) throw new Error("El monto debe ser positivo");
  const res = await api.patch(`/inventory/${id}/stock`, { amount, type, reason });
  return unwrap<InventoryItem>(res) as InventoryItem;
};
