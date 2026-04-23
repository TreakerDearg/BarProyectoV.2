// services/rouletteService.ts

import api from "../../../services/api";
import socket from "../../../services/socket";
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
    socket.on("roulette:spin", (data) => {
      if (data?.result?._id) cb(data);
    });
  },

  /* 🔄 UPDATE */
  onUpdate: (cb: (data: RouletteDrink[]) => void) => {
    socket.on("roulette:update", (data) => {
      if (Array.isArray(data)) cb(data);
    });
  },

  /* 📊 LOGS */
  onLog: (cb: (log: RouletteLog) => void) => {
    socket.on("roulette:log", (log) => {
      if (log?._id) cb(log);
    });
  },

  /* 🧹 CLEAN */
  offAll: () => {
    socket.off("roulette:spin");
    socket.off("roulette:update");
    socket.off("roulette:log");
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
   API - SPIN
============================== */
export const spinRoulette = async (): Promise<RouletteSpinResult> => {
  return safeRequest<RouletteSpinResult>(
    api.post(`${BASE}/spin`)
  );
};