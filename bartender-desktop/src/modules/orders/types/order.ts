import type { Product } from "../../../types/product";

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id?: string;
  tableNumber: number;
  items: OrderItem[];
  status: "pending" | "preparing" | "completed" | "cancelled";
  total: number;
  createdAt?: string;
  updatedAt?: string;
}