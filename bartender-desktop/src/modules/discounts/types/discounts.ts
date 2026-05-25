/**
 * Nebula Discount System - Tipos Compartidos
 * Sistema de descuentos unificado bajo marca Nebula
 */

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
  originalPrice?: number;
  discountApplied?: {
    amount: number;
    reason: string;
    type?: string;
  };
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

/**
 * Tipos adicionales para consistencia Nebula
 */
export type DiscountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface NebulaDiscountStats {
  totalDiscounts: number;
  totalAmount: number;
  averageDiscount: number;
  byReason: Record<DiscountReason, number>;
  recentDiscounts: Array<{
    id: string;
    table: string;
    amount: number;
    reason: DiscountReason;
    date: string;
  }>;
}

export interface DiscountRequest {
  orderId: string;
  method: DiscountType;
  value: number;
  items: string[];
  reason: DiscountReason;
  note?: string;
}

export interface DiscountResponse {
  success: boolean;
  discount?: {
    _id: string;
    orderId: string;
    method: DiscountType;
    value: number;
    reason: DiscountReason;
    status: DiscountStatus;
  };
  error?: string;
}