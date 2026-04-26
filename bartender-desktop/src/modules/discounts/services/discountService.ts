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

  async getActiveOrders(): Promise<Order[]> {
    const orders = await getOrders({ sessionStatus: "open" });
    return orders
      .filter((order) => Array.isArray(order.items) && order.items.length > 0)
      .map((order: any) => ({
        ...order,
        table: resolveTableLabel(order.table),
      }));
  },

  async getDiscountsByOrder(orderId: string) {
    try {
      const { data } = await api.get(`/discounts/order/${orderId}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async getTodayStats() {
    try {
      const { data } = await api.get("/discounts", { params: { limit: 300 } });
      const discounts = Array.isArray(data) ? data : [];
      const today = new Date();

      const sameDay = discounts.filter((d: any) => {
        if (!d?.createdAt) return false;
        const dt = new Date(d.createdAt);
        return (
          dt.getFullYear() === today.getFullYear() &&
          dt.getMonth() === today.getMonth() &&
          dt.getDate() === today.getDate()
        );
      });

      const todayTotal = sameDay.reduce(
        (acc: number, d: any) => acc + Number(d?.amountApplied || 0),
        0
      );

      const percentDiscounts = sameDay.filter((d: any) => d?.type === "PERCENT");
      const averagePercent = percentDiscounts.length
        ? percentDiscounts.reduce(
            (acc: number, d: any) => acc + Number(d?.value || 0),
            0
          ) / percentDiscounts.length
        : 0;

      return {
        todayTotal,
        averagePercent,
        appliedCount: sameDay.length,
      };
    } catch (error) {
      throw new Error(extractError(error));
    }
  },
};