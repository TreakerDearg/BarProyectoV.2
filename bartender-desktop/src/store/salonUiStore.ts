import { create } from "zustand";

export type SalonMode = "simple" | "advanced";

const STORAGE_KEY = "nebula_salon_mode";

function readMode(): SalonMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "advanced" || v === "simple") return v;
  } catch {
    /* ignore */
  }
  return "simple";
}

interface SalonUiState {
  mode: SalonMode;
  setMode: (mode: SalonMode) => void;
  toggleMode: () => void;
}

export const useSalonUiStore = create<SalonUiState>((set) => ({
  mode: readMode(),

  setMode: (mode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    set({ mode });
  },

  toggleMode: () =>
    set((s) => {
      const next: SalonMode = s.mode === "simple" ? "advanced" : "simple";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return { mode: next };
    }),
}));
