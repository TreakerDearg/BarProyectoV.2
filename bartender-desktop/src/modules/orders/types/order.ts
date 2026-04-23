import type { Product } from "../../../types/product";

/* ==============================
   ORDER ITEM (BACKEND SAFE)
============================== */
export interface OrderItem {
  _id?: string;

  product: Product | string; 
  // puede venir populated o solo ID

  quantity: number;

  price: number;

  type: "drink" | "food";

  status: "pending" | "preparing" | "ready" | "delivered";
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