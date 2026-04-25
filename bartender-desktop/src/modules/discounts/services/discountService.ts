// services/discountService.ts

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/discounts",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   TYPES
========================= */
export interface ApplyDiscountDTO {
  orderId: string;
  items: {
    product: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  type: "PERCENT" | "FLAT";
  value: number;
  reason: string;
  note?: string;
}

/* =========================
   SERVICE
========================= */
export const discountService = {
  async applyDiscount(data: ApplyDiscountDTO) {
    const response = await api.post("/", data);
    return response.data;
  },

  async getDiscountsByOrder(orderId: string) {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
  },

  async getTodayStats() {
    const response = await api.get("/stats/today");
    return response.data;
  },
};