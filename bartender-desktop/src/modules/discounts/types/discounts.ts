// types/discount.types.ts

export type DiscountType = "PERCENT" | "FLAT";

export type DiscountReason =
  | "WAIT_TIME"
  | "QUALITY_ISSUE"
  | "COMP"
  | "EMPLOYEE"
  | "OTHER";

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  table: string;
  customerName: string;
  total: number;
  items: OrderItem[];
}

export interface SelectedItem extends OrderItem {
  selected: boolean;
}