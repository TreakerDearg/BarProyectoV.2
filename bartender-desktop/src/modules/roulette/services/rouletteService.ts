// services/rouletteService.ts

import api from "../../../services/api";
import { getSocket } from "../../../services/socket";
import type {
  RouletteDrink,
  RouletteSpinResult,
} from "../types/roulette";

/* ==============================
   TYPES
============================== */
export interface RouletteLog {
  _id: string;
  type: "create" | "update" | "delete" | "toggle" | "system";
  message: string;
  drinkId?: string;
  meta?: any;
  createdAt: string;
}

/* ==============================
   SAFE WRAPPER
============================== */
const safeRequest = async <T>(promise: Promise<any>): Promise<T> => {
  try {
    const { data } = await promise;
    return data as T;
  } catch (error: any) {
    const msg =
      error?.response?.data?.error ||
      error?.message ||
      "Unexpected error";

    throw new Error(msg);
  }
};

const BASE = "/roulette";

/* ==============================
   SOCKET MANAGER (PRO)
============================== */
export const rouletteSocket = {
  /* 🎡 SPIN */
  onSpin: (cb: (data: RouletteSpinResult) => void) => {
    getSocket()?.on("roulette:spin", (data) => {
      if (data?.result?._id) cb(data);
    });
  },

  /* 🔄 UPDATE */
  onUpdate: (cb: (data: RouletteDrink[]) => void) => {
    getSocket()?.on("roulette:update", (data) => {
      if (Array.isArray(data)) cb(data);
    });
  },

  /* 📊 LOGS */
  onLog: (cb: (log: RouletteLog) => void) => {
    getSocket()?.on("roulette:log", (log) => {
      if (log?._id) cb(log);
    });
  },

  /* 🧹 CLEAN */
  offAll: () => {
    getSocket()?.off("roulette:spin");
    getSocket()?.off("roulette:update");
    getSocket()?.off("roulette:log");
  },
};

/* ==============================
   API - GET DRINKS
============================== */
export const getRouletteDrinks = async (): Promise<RouletteDrink[]> => {
  const data = await safeRequest<RouletteDrink[]>(
    api.get(BASE)
  );

  return Array.isArray(data) ? data : [];
};

/* ==============================
   API - GET LOGS
============================== */
export const getRouletteLogs = async (): Promise<RouletteLog[]> => {
  const data = await safeRequest<RouletteLog[]>(
    api.get(`${BASE}/logs`)
  );

  return Array.isArray(data) ? data : [];
};

/* ==============================
   API - CREATE
============================== */
export const createRouletteDrink = async (
  drink: Partial<RouletteDrink>
): Promise<RouletteDrink> => {
  if (!drink?.name || !drink?.weight) {
    throw new Error("Nombre y peso son obligatorios");
  }

  return safeRequest<RouletteDrink>(
    api.post(BASE, drink)
  );
};

/* ==============================
   API - UPDATE
============================== */
export const updateRouletteDrink = async (
  id: string,
  updates: Partial<RouletteDrink>
): Promise<RouletteDrink> => {
  if (!id) throw new Error("ID inválido");

  return safeRequest<RouletteDrink>(
    api.patch(`${BASE}/${id}`, updates)
  );
};

/* ==============================
   API - DELETE
============================== */
export const deleteRouletteDrink = async (id: string) => {
  if (!id) throw new Error("ID inválido");

  return safeRequest(
    api.delete(`${BASE}/${id}`)
  );
};

/* ==============================
   API - SPIN (PUBLIC & ADMIN)
============================== */
export const spinRoulette = async (isPublic = false): Promise<RouletteSpinResult> => {
  const endpoint = isPublic ? `${BASE}/public/spin` : `${BASE}/spin`;
  return safeRequest<RouletteSpinResult>(
    api.post(endpoint)
  );
};

/* ==============================
   API - BATCH UPDATE
============================== */
export const batchUpdateRouletteDrinks = async (
  updates: Array<{ id: string; weight?: number; active?: boolean; rarity?: string }>
) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error("Updates array is required");
  }

  return safeRequest(
    api.patch(`${BASE}/batch`, { updates })
  );
};

/* ==============================
   API - SIMULATE (MONTE CARLO)
============================== */
export interface SimulationResult {
  iterations: number;
  kpiScoreSimulated: number;
  items: Array<{
    _id: string;
    name: string;
    rarity: string;
    category: string;
    color: string;
    baseWeight: number;
    stockMultiplier: number;
    luckMultiplier: number;
    calculatedWeight: number;
    theoreticalProbability: number;
    simulatedWins: number;
    simulatedProbability: number;
    deviation: number;
  }>;
  rarityStats: Record<
    string,
    { theoretical: number; simulated: number; wins: number; deviation: number }
  >;
  audit: {
    averageDeviation: number;
    chiSquare: number;
    isStatisticallyStable: boolean;
    recommendation: string;
  };
}

export const simulateRoulette = async (
  iterations: number,
  kpiScore: number,
  customWeights?: Record<string, number>
): Promise<SimulationResult> => {
  return safeRequest<SimulationResult>(
    api.post(`${BASE}/simulate`, { iterations, kpiScore, customWeights })
  );
};

/* ==============================
   API - CONFIG
============================== */
export interface RouletteConfig {
  pityThresholds: {
    RARE: number;
    EPIC: number;
    LEGENDARY: number;
  };
  pityBoostMultiplier: number;
  rarityModifiers: {
    COMMON: number;
    RARE: number;
    EPIC: number;
    LEGENDARY: number;
  };
  kpiMinScore: number;
  kpiMaxMultiplier: number;
}

export const getRouletteConfig = async (): Promise<RouletteConfig> => {
  return safeRequest<RouletteConfig>(api.get(`${BASE}/config`));
};

export const updateRouletteConfig = async (config: RouletteConfig): Promise<RouletteConfig> => {
  return safeRequest<RouletteConfig>(api.put(`${BASE}/config`, config));
};

/* ==============================
   API - EMPLOYEES STATS
============================== */
export interface EmployeeRouletteStats {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    shift: string | null;
    kpiScore: number;
    hasLuckBuff: boolean;
    luckMultiplier: number;
  };
  stats: {
    totalSpins: number;
    spinsSinceCommon: number;
    spinsSinceRare: number;
    spinsSinceEpic: number;
    spinsSinceLegendary: number;
    prizesWon: {
      common: number;
      rare: number;
      epic: number;
      legendary: number;
    };
    pityActive: boolean;
    pityTargetRarity: string | null;
    nextRarePity: number;
    nextEpicPity: number;
    nextLegendaryPity: number;
  };
}

export const getAllUserRouletteStats = async (): Promise<EmployeeRouletteStats[]> => {
  const data = await safeRequest<EmployeeRouletteStats[]>(api.get(`${BASE}/employees-stats`));
  return Array.isArray(data) ? data : [];
};

export const getMyRouletteStats = async () => {
  return safeRequest<any>(api.get(`${BASE}/my-stats`));
};