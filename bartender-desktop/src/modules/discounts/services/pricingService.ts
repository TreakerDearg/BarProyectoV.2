import api from "../../../services/api";

export interface Promotion {
  _id: string;
  name: string;
  description?: string;
  type: "PERCENT" | "FLAT" | "2X1" | "CUSTOM";
  value: number;
  schedule: {
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    startDate?: string;
    endDate?: string;
  };
  isActive: boolean;
  applicableProducts: any[];
}

export interface PricingEvent {
  _id: string;
  type: string;
  title: string;
  detail: string;
  level: "info" | "ok" | "warn" | "error";
  createdAt: string;
}

export const pricingService = {
  // Dynamic Pricing
  async getGlobalMultiplier() {
    const { data } = await api.get("/dynamic-pricing");
    const rule = data.find((r: any) => r.name === "GLOBAL_BASE");
    return rule ? rule.multiplier : 1.0;
  },

  async updateGlobalMultiplier(multiplier: number) {
    const { data } = await api.post("/dynamic-pricing/multiplier", { multiplier });
    return data;
  },

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    const { data } = await api.get("/promotions");
    return data;
  },

  async createPromotion(promo: Partial<Promotion>) {
    const { data } = await api.post("/promotions", promo);
    return data;
  },

  async deletePromotion(id: string) {
    const { data } = await api.delete(`/promotions/${id}`);
    return data;
  },

  // Events
  async getPricingEvents(): Promise<PricingEvent[]> {
    const { data } = await api.get("/pricing-events");
    return data;
  },

  // Auto Promotions Toggle
  async getAutoPromotionsStatus() {
    const { data } = await api.get("/dynamic-pricing/auto-promotions");
    return data.isAutoPromotionsEnabled;
  },

  async toggleAutoPromotionsStatus(isEnabled: boolean) {
    const { data } = await api.post("/dynamic-pricing/auto-promotions", { isEnabled });
    return data.isAutoPromotionsEnabled;
  }
};
