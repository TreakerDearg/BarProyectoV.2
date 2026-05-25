import { api } from "@/lib/api/client";

/* =========================
   TYPES
========================= */
export interface RouletteDrink {
  _id: string;
  name: string;
  weight: number;
  color: string;
  category: string;
  price?: number;
  product?: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  pityThreshold?: number;
  active: boolean;
  deleted: boolean;
  totalSpins?: number;
  totalWins?: number;
  lastSelectedAt?: string;
  probability?: number;
}

export interface RouletteLog {
  _id: string;
  type: "create" | "update" | "delete" | "toggle" | "spin" | "system";
  message: string;
  drinkId?: string;
  performedBy?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface RouletteStats {
  totalDrinks: number;
  activeDrinks: number;
  totalSpins: number;
  rarityDistribution: Record<string, number>;
  topDrinks: Array<{
    name: string;
    totalSpins: number;
    totalWins: number;
    winRate: number;
  }>;
}

/* =========================
   ERROR HANDLER
========================= */
const extractError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  const err = error as Record<string, unknown>;
  return (
    String(err?.response?.data?.message) ||
    String(err?.response?.data?.error) ||
    String(err?.message) ||
    "Unexpected error"
  );
};

/* =========================
   NORMALIZER
========================= */
const normalizeRouletteDrink = (drink: Partial<RouletteDrink>) => ({
  name: drink.name?.trim(),
  weight: Number(drink.weight ?? 10),
  color: drink.color || "#D4A340",
  category: drink.category?.trim().toLowerCase() || "general",
  price: Number(drink.price ?? 0),
  product: drink.product || null,
  rarity: (drink.rarity || "COMMON") as "COMMON" | "RARE" | "EPIC" | "LEGENDARY",
  pityThreshold: drink.pityThreshold ? Number(drink.pityThreshold) : undefined,
  active: drink.active ?? true,
});

/* =========================
   GET DRINKS
========================= */
export const getRouletteDrinks = async (): Promise<RouletteDrink[]> => {
  try {
    const { data } = await api.get("/roulette");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* =========================
   GET LOGS
========================= */
export const getRouletteLogs = async (limit = 50): Promise<RouletteLog[]> => {
  try {
    const { data } = await api.get("/roulette/logs", { params: { limit } });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* =========================
   CREATE
========================= */
export const createRouletteDrink = async (
  drink: Partial<RouletteDrink>
): Promise<RouletteDrink> => {
  try {
    const payload = normalizeRouletteDrink(drink);
    const { data } = await api.post("/roulette", payload);
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* =========================
   UPDATE
========================= */
export const updateRouletteDrink = async (
  id: string,
  drink: Partial<RouletteDrink>
): Promise<RouletteDrink> => {
  try {
    const payload = normalizeRouletteDrink(drink);
    const { data } = await api.patch(`/roulette/${id}`, payload);
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* =========================
   DELETE
========================= */
export const deleteRouletteDrink = async (id: string): Promise<void> => {
  try {
    await api.delete(`/roulette/${id}`);
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* =========================
   BATCH UPDATE
========================= */
export const batchUpdateRouletteDrinks = async (
  updates: Array<{ id: string; weight?: number; active?: boolean; rarity?: string }>
): Promise<{ success: boolean; modifiedCount: number }> => {
  try {
    const { data } = await api.patch("/roulette/batch", { updates });
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* =========================
   SPIN (ADMIN)
========================= */
export const spinRouletteAdmin = async (): Promise<{
  result: RouletteDrink;
  meta: Record<string, unknown>;
}> => {
  try {
    const { data } = await api.post("/roulette/spin");
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* =========================
   ANALYTICS
========================= */
export const getRouletteAnalytics = async (params?: {
  userId?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  type?: string;
}): Promise<{
  summary: {
    totalLogs: number;
    totalSpins: number;
    pityTriggered: number;
    pityRate: number;
  };
  distribution: {
    byType: Record<string, number>;
    byLocation: Record<string, number>;
    byRarity: Record<string, number>;
  };
  topDrinks: Array<{ name: string; count: number }>;
  recentActivity: RouletteLog[];
}> => {
  try {
    const { data } = await api.get("/roulette/analytics", { params });
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};
