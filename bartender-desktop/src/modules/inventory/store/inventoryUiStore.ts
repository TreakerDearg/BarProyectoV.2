import { create } from "zustand";
import type { InventoryItem } from "../types/inventory";

export type InventoryMode = "simple" | "advanced";
export type InventoryView = "grid" | "list";
export type InventoryPageView = "list" | "form";

const MODE_KEY = "nebula_inventory_mode";
const VIEW_KEY = "nebula_inventory_view";

interface InventoryUiState {
  mode: InventoryMode;
  view: InventoryView;
  pageView: InventoryPageView;
  selectedItem: InventoryItem | null;
  isDrawerOpen: boolean;
  setMode: (mode: InventoryMode) => void;
  toggleMode: () => void;
  setView: (view: InventoryView) => void;
  toggleView: () => void;
  setPageView: (view: InventoryPageView) => void;
  setSelectedItem: (item: InventoryItem | null) => void;
  toggleDrawer: () => void;
  openDrawer: (item: InventoryItem) => void;
  closeDrawer: () => void;
}

function readStoredMode(): InventoryMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "advanced" || stored === "simple") return stored;
  } catch {
    /* ignore */
  }
  return "simple";
}

function readStoredView(): InventoryView {
  try {
    const stored = localStorage.getItem(VIEW_KEY);
    if (stored === "grid" || stored === "list") return stored;
  } catch {
    /* ignore */
  }
  return "grid";
}

export const useInventoryUiStore = create<InventoryUiState>((set) => ({
  mode: readStoredMode(),
  view: readStoredView(),
  pageView: "list",
  selectedItem: null,
  isDrawerOpen: false,

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
      const next: InventoryMode =
        state.mode === "simple" ? "advanced" : "simple";
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
      const next: InventoryView = state.view === "grid" ? "list" : "grid";
      try {
        localStorage.setItem(VIEW_KEY, next);
      } catch {
        /* ignore */
      }
      return { view: next };
    }),

  setPageView: (pageView) => set({ pageView }),

  setSelectedItem: (selectedItem) => set({ selectedItem }),

  toggleDrawer: () =>
    set((state) => ({
      isDrawerOpen: !state.isDrawerOpen,
      selectedItem: state.isDrawerOpen ? null : state.selectedItem,
    })),

  openDrawer: (item) => set({ selectedItem: item, isDrawerOpen: true }),

  closeDrawer: () => set({ isDrawerOpen: false, selectedItem: null }),
}));