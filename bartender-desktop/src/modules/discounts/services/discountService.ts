import api from "../../../services/api";
import { applyDiscount, getOrders } from "../../orders/services/orderService";
import type { DiscountReason, DiscountType, Order } from "../types/discounts";

/* =========================
   TYPES
========================= */
export interface ApplyDiscountDTO {
  orderId: string;
  items: string[];
  type: DiscountType;
  value: number;
  reason: DiscountReason;
  note?: string;
  promotionId?: string;
}

const extractError = (error: any): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unexpected error"
  );
};

const resolveTableLabel = (table: Order["table"]): string => {
  if (typeof table === "string") return table;
  if (table?.number !== undefined && table?.number !== null) return String(table.number);
  if (table?._id) return table._id;
  return "N/A";
};

/* =========================
   SERVICE
========================= */
export const discountService = {
  async applyDiscount(data: ApplyDiscountDTO) {
    try {
      return await applyDiscount(data);
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async getActiveOrders(signal?: AbortSignal): Promise<Order[]> {
    const orders = await getOrders({ sessionStatus: "open", signal });
    return orders
      .filter((order) => Array.isArray(order.items) && order.items.length > 0)
      .map((order: any) => ({
        ...order,
        table: resolveTableLabel(order.table),
      }));
  },

  async getDiscountsByOrder(orderId: string, signal?: AbortSignal) {
    try {
      const { data } = await api.get(`/discounts/order/${orderId}`, { signal });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async getTodayStats(signal?: AbortSignal) {
    try {
      const { data } = await api.get("/discounts/stats/daily", { signal });
      return {
        todayTotal: data.summary.totalAmount,
        averagePercent: data.byType.PERCENT.averageValue,
        appliedCount: data.summary.totalDiscounts,
        byType: data.byType,
        byReason: data.byReason,
        byEmployee: data.byEmployee,
        byTable: data.byTable,
      };
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async getDailyLimitRemaining(signal?: AbortSignal) {
    try {
      const { data } = await api.get("/discounts/limits/remaining", { signal });
      return data;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },
};