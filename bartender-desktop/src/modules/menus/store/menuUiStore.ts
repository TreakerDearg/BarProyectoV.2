import { create } from "zustand";

export type MenuMode = "simple" | "advanced";
export type MenuView = "grid" | "list";

const MODE_KEY = "nebula_menu_mode";
const VIEW_KEY = "nebula_menu_view";

interface MenuUiState {
  mode: MenuMode;
  view: MenuView;
  setMode: (mode: MenuMode) => void;
  toggleMode: () => void;
  setView: (view: MenuView) => void;
  toggleView: () => void;
}

function readStoredMode(): MenuMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "advanced" || stored === "simple") return stored;
  } catch {
    /* ignore */
  }
  return "simple";
}

function readStoredView(): MenuView {
  try {
    const stored = localStorage.getItem(VIEW_KEY);
    if (stored === "grid" || stored === "list") return stored;
  } catch {
    /* ignore */
  }
  return "grid";
}

export const useMenuUiStore = create<MenuUiState>((set) => ({
  mode: readStoredMode(),
  view: readStoredView(),

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
      const next: MenuMode = state.mode === "simple" ? "advanced" : "simple";
      try {
        localStorage.setItem(MODE_KEY, next);
      } catch {
        /* ignore */
      }
      return { mode: next };
    }),

  setView: (view) => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* ignore */
    }
    set({ view });
  },

  toggleView: () =>
    set((state) => {
      const next: MenuView = state.view === "grid" ? "list" : "grid";
      try {
        localStorage.setItem(VIEW_KEY, next);
      } catch {
        /* ignore */
      }
      return { view: next };
    }),
}));