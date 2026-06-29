import type { Product } from "../../../types/product";

/* ==============================
   ORDER ITEM (BACKEND SAFE)
============================== */
export interface OrderItem {
  _id?: string;

  product?: Product | string;
  // puede venir populated o solo ID

  menu?: string;
  // referencia a menú

  name?: string;
  // snapshot del nombre para auditoría

  quantity: number;

  price: number;

  type: "drink" | "food" | "menu";

  status: "pending" | "preparing" | "ready" | "served" | "cancelled";

  notes?: string;

  menuItems?: string[];
  // IDs de productos si es un menú
}

/* ==============================
   ORDER (POS READY)
============================== */
export interface Order {
  _id?: string;

  table: string; 
  // SIEMPRE string (ObjectId)

  items: OrderItem[];

  status: "pending" | "in-progress" | "completed" | "cancelled";

  total: number;

  sessionId?: string;

  sessionStatus?: "open" | "closed";

  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}