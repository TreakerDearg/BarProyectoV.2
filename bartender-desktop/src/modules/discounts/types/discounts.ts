export type DiscountType = "PERCENT" | "FLAT";

export type DiscountReason =
  | "WAIT_TIME"
  | "QUALITY_ISSUE"
  | "COMP"
  | "EMPLOYEE"
  | "OTHER";

export interface OrderItem {
  _id: string;
  product: string;
  name: string;
  price: number;
  quantity: number;
  type?: "drink" | "food";
  status?: "pending" | "preparing" | "ready" | "served" | "cancelled";
}

export interface Order {
  _id: string;
  table: string | { _id?: string; number?: number | string };
  total: number;
  subtotal?: number;
  sessionStatus?: "open" | "closed";
  status?: "pending" | "in-progress" | "completed" | "cancelled";
  createdAt?: string;
  items: OrderItem[];
}

export interface SelectedItem extends OrderItem {
  selected: boolean;
}

export interface DiscountStatsData {
  todayTotal: number;
  averagePercent: number;
  appliedCount: number;
}