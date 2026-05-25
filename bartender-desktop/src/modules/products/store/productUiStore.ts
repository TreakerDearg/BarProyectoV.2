import { create } from "zustand";

export type ProductMode = "simple" | "advanced";
export type ProductView = "grid" | "list";

const MODE_KEY = "nebula_product_mode";
const VIEW_KEY = "nebula_product_view";

interface ProductUiState {
  mode: ProductMode;
  view: ProductView;
  setMode: (mode: ProductMode) => void;
  toggleMode: () => void;
  setView: (view: ProductView) => void;
  toggleView: () => void;
}

function readStoredMode(): ProductMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "advanced" || stored === "simple") return stored;
  } catch {
    /* ignore */
  }
  return "simple";
}

function readStoredView(): ProductView {
  try {
    const stored = localStorage.getItem(VIEW_KEY);
    if (stored === "grid" || stored === "list") return stored;
  } catch {
    /* ignore */
  }
  return "grid";
}

export const useProductUiStore = create<ProductUiState>((set) => ({
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
      const next: ProductMode = state.mode === "simple" ? "advanced" : "simple";
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
      const next: ProductView = state.view === "grid" ? "list" : "grid";
      try {
        localStorage.setItem(VIEW_KEY, next);
      } catch {
        /* ignore */
      }
      return { view: next };
    }),
}));