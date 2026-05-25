import { create } from "zustand";

export type DashboardMode = "simple" | "advanced";
export type DashboardTab = "service" | "analytics" | "sales" | "inventory";

const MODE_KEY = "nebula_dashboard_mode";

interface DashboardUiState {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
  toggleMode: () => void;
}

function readStoredMode(): DashboardMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "advanced" || stored === "simple") return stored;
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
      const next: DashboardMode =
        state.mode === "simple" ? "advanced" : "simple";
      try {
        localStorage.setItem(MODE_KEY, next);
      } catch {
        /* ignore */
      }
      return { mode: next };
    }),
}));
