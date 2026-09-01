import { create } from "zustand";
import type { InventoryItem } from "../types/inventory";

/**
 * Tres niveles de información:
 *   basic    — compacto: nombre, stock, estado, ajuste rápido ±1
 *   standard — estándar: + imagen, proveedor, costo, barra de stock, ajuste con cantidad + motivo
 *   advanced — completo: fila horizontal, + valor total, recetas vinculadas, forecasting, todas las acciones
 */
export type InventoryMode = "basic" | "standard" | "advanced";
export type InventoryView = "grid" | "list";
export type InventoryPageView = "list" | "form";

const MODE_KEY = "nebula_inventory_mode_v2";
const VIEW_KEY = "nebula_inventory_view";

interface InventoryUiState {
  mode:         InventoryMode;
  view:         InventoryView;
  pageView:     InventoryPageView;
  selectedItem: InventoryItem | null;
  isDrawerOpen: boolean;

  setMode:         (mode: InventoryMode) => void;
  setView:         (view: InventoryView) => void;
  toggleView:      () => void;
  setPageView:     (view: InventoryPageView) => void;
  setSelectedItem: (item: InventoryItem | null) => void;
  toggleDrawer:    () => void;
  openDrawer:      (item: InventoryItem) => void;
  closeDrawer:     () => void;
}

function readStoredMode(): InventoryMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "basic" || v === "standard" || v === "advanced") return v;
  } catch { /* ignore */ }
  return "standard";
}

function readStoredView(): InventoryView {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === "grid" || v === "list") return v;
  } catch { /* ignore */ }
  return "grid";
}

export const useInventoryUiStore = create<InventoryUiState>((set) => ({
  mode:         readStoredMode(),
  view:         readStoredView(),
  pageView:     "list",
  selectedItem: null,
  isDrawerOpen: false,

  setMode: (mode) => {
    try { localStorage.setItem(MODE_KEY, mode); } catch { /**/ }
    set({ mode });
  },

  setView: (view) => {
    try { localStorage.setItem(VIEW_KEY, view); } catch { /**/ }
    set({ view });
  },

  toggleView: () =>
    set((s) => {
      const next: InventoryView = s.view === "grid" ? "list" : "grid";
      try { localStorage.setItem(VIEW_KEY, next); } catch { /**/ }
      return { view: next };
    }),

  setPageView:     (pageView)  => set({ pageView }),
  setSelectedItem: (item)      => set({ selectedItem: item }),

  toggleDrawer: () =>
    set((s) => ({
      isDrawerOpen: !s.isDrawerOpen,
      selectedItem: s.isDrawerOpen ? null : s.selectedItem,
    })),

  openDrawer:  (item) => set({ selectedItem: item, isDrawerOpen: true }),
  closeDrawer: ()     => set({ isDrawerOpen: false, selectedItem: null }),
}));
