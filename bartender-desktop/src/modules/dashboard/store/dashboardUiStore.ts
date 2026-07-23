import { create } from "zustand";

export type DashboardMode = "simple" | "medium" | "advanced";
export type DashboardTab = "operation" | "analytics" | "inventory";

const MODE_KEY = "nebula_dashboard_mode";

interface DashboardUiState {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
  toggleMode: () => void;
}

function readStoredMode(): DashboardMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "advanced" || stored === "simple" || stored === "medium") return stored;
  } catch {
    /* ignore */
  }
  return "simple";
}

export const useDashboardUiStore = create<DashboardUiState>((set) => ({
  mode: readStoredMode(),

  setMode: (mode) => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
    set({ mode });
  },

  toggleMode: () =>
    set((state) => {
      let next: DashboardMode = "simple";
      if (state.mode === "simple") next = "medium";
      else if (state.mode === "medium") next = "advanced";
      else if (state.mode === "advanced") next = "simple";
      
      try {
        localStorage.setItem(MODE_KEY, next);
      } catch {
        /* ignore */
      }
      return { mode: next };
    }),
}));
