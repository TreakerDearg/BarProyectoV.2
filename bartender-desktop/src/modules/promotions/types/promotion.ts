export type PromotionType = "PERCENT" | "FLAT" | "2X1" | "CUSTOM";

export interface PromotionSchedule {
  daysOfWeek?: string[];
  startTime?:  string;
  endTime?:    string;
  startDate?:  string | null;
  endDate?:    string | null;
}

export interface PromotionProduct {
  _id:   string;
  name:  string;
  price: number;
  image: string;
  available: boolean;
}

export interface Promotion {
  _id?:                  string;
  name:                  string;
  description?:          string;
  type:                  PromotionType;
  value:                 number;
  schedule?:             PromotionSchedule;
  applicableProducts?:   PromotionProduct[] | string[];
  applicableCategories?: string[];
  isActive:              boolean;
  createdBy?:            string;
  createdAt?:            string;
  updatedAt?:            string;
}

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  PERCENT: "Porcentaje (%)",
  FLAT:    "Descuento fijo ($)",
  "2X1":   "2×1",
  CUSTOM:  "Personalizado",
};

export const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

export const DAYS_ES: Record<string, string> = {
  Monday:    "Lunes",
  Tuesday:   "Martes",
  Wednesday: "Miércoles",
  Thursday:  "Jueves",
  Friday:    "Viernes",
  Saturday:  "Sábado",
  Sunday:    "Domingo",
};
