import api from "../../../services/api";

export interface BusinessConfig {
  name: string;
  legalName: string;
  taxId: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  currencyPosition: "before" | "after";
  logo: string | null;
  openingHours: string;
}

export interface PosConfig {
  suggestedTipPercent: number;
  taxPercent: number;
  taxIncluded: boolean;
  delayedOrderMinutesBar: number;
  delayedOrderMinutesKitchen: number;
  soundAlerts: boolean;
  allowZeroStockSale: boolean;
  autoPrintOrders: boolean;
}

export interface LoyaltyConfig {
  pointsPerCurrencyUnit: number;
  welcomeBonusPoints: number;
  pointsExpiryDays: number;
  isActive: boolean;
  minRedemptionPoints: number;
}

export interface HomeFeaturedConfig {
  headline: string;
  subtitle: string;
  badge: string;
  maxItems: number;
  productIds?: string[];
  products?: any[];
}

export interface SystemConfig {
  _id?: string;
  business: BusinessConfig;
  pos: PosConfig;
  loyalty: LoyaltyConfig;
  homeFeatured?: HomeFeaturedConfig;
  updatedAt?: string;
}

const unwrap = (res: any): any => res?.data ?? res ?? null;

export const getSystemConfig = async (): Promise<SystemConfig> => {
  const res = await api.get("/config");
  return unwrap(res);
};

export const updateSystemConfig = async (
  updates: Partial<SystemConfig>
): Promise<SystemConfig> => {
  const res = await api.put("/config", updates);
  return unwrap(res);
};

export const getHomeFeatured = async (): Promise<HomeFeaturedConfig> => {
  const res = await api.get("/config/home-featured");
  return unwrap(res);
};

export const updateHomeFeatured = async (
  data: Partial<HomeFeaturedConfig>
): Promise<HomeFeaturedConfig> => {
  const res = await api.put("/config/home-featured", data);
  return unwrap(res);
};
