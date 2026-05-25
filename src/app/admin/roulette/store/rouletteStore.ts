import { create } from "zustand";
import type { RouletteDrink, RouletteLog } from "../services/rouletteService";

type RouletteAdminState = {
  drinks: RouletteDrink[];
  logs: RouletteLog[];
  loading: boolean;
  spinning: boolean;
  lastResult: RouletteDrink | null;
  error: string | null;

  setDrinks: (drinks: RouletteDrink[]) => void;
  setLogs: (logs: RouletteLog[]) => void;
  setLoading: (loading: boolean) => void;
  setSpinning: (spinning: boolean) => void;
  setLastResult: (result: RouletteDrink | null) => void;
  setError: (error: string | null) => void;
  
  updateDrink: (id: string, updates: Partial<RouletteDrink>) => void;
  addDrink: (drink: RouletteDrink) => void;
  removeDrink: (id: string) => void;
  addLog: (log: RouletteLog) => void;
};

export const useRouletteStore = create<RouletteAdminState>((set) => ({
  drinks: [],
  logs: [],
  loading: false,
  spinning: false,
  lastResult: null,
  error: null,

  setDrinks: (drinks) => set({ drinks }),
  setLogs: (logs) => set({ logs }),
  setLoading: (loading) => set({ loading }),
  setSpinning: (spinning) => set({ spinning }),
  setLastResult: (lastResult) => set({ lastResult }),
  setError: (error) => set({ error }),

  updateDrink: (id, updates) =>
    set((state) => ({
      drinks: state.drinks.map((d) =>
        d._id === id ? { ...d, ...updates } : d
      ),
    })),

  addDrink: (drink) =>
    set((state) => ({
      drinks: [...state.drinks, drink],
    })),

  removeDrink: (id) =>
    set((state) => ({
      drinks: state.drinks.filter((d) => d._id !== id),
    })),

  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs].slice(0, 50), // Keep last 50 logs
    })),
}));
