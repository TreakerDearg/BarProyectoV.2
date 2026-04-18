export interface InventoryItem {
  _id?: string;

  /* =========================
     BASIC INFO
  ========================= */
  name: string;
  description?: string;

  /* =========================
     STOCK
  ========================= */
  stock: number;
  minStock: number;
  maxStock: number;

  /* =========================
     UNIT SYSTEM
  ========================= */
  unit: "ml" | "l" | "g" | "kg" | "unit" | "oz" | "portion";

  /* =========================
     CLASSIFICATION
  ========================= */
  sector: "bar" | "kitchen" | "general";
  category: string;

  /* =========================
     COST
  ========================= */
  cost: number;

  /* =========================
     SUPPLIER
  ========================= */
  supplier: string;

  /* =========================
     LOCATION
  ========================= */
  location: "bar" | "kitchen" | "storage";

  /* =========================
     STATUS
  ========================= */
  isActive: boolean;

  /* =========================
     TIMESTAMPS
  ========================= */
  createdAt?: string;
  updatedAt?: string;

  /* =========================
     VIRTUALS (backend computed)
  ========================= */
  stockStatus?: "critical" | "low" | "optimal";
  isLowStock?: boolean;
  usagePercent?: number;
}