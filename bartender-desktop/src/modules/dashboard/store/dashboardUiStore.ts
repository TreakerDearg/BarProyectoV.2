import { create } from "zustand";

export type DashboardMode = "simple" | "medium" | "advanced";
export type DashboardView = "operation" | "analytics" | "inventory";

const MODE_KEY = "nebula_dashboard_mode_v2";
const VIEW_KEY = "nebula_dashboard_view";

interface DashboardUiState {
  mode:    DashboardMode;
  view:    DashboardView;
  setMode: (mode: DashboardMode) => void;
  setView: (view: DashboardView) => void;
}

function readMode(): DashboardMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "simple" || v === "medium" || v === "advanced") return v;
  } catch { /* ignore */ }
  return "medium";
}

function readView(): DashboardView {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === "operation" || v === "analytics" || v === "inventory") return v;
  } catch { /* ignore */ }
  return "operation";
}

export const useDashboardUiStore = create<DashboardUiState>((set) => ({
  mode: readMode(),
  view: readView(),

  setMode: (mode) => {
    try { localStorage.setItem(MODE_KEY, mode); } catch { /**/ }
    set({ mode });
  },

  setView: (view) => {
    try { localStorage.setItem(VIEW_KEY, view); } catch { /**/ }
    set({ view });
  },
}));

// Legacy alias kept so old imports don't break
export type DashboardTab = DashboardView;
