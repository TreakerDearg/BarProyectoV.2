import { create } from "zustand";

/**
 * Tres niveles de información para las mesas — igual que inventory/products:
 *   basic    — Solo nombre, estado, capacidad y acciones rápidas (abrir/cerrar)
 *   standard — + código de mesa, totales, tiempo abierta, órdenes activas
 *   advanced — + analytics inline, historial de pagos, KPIs completos
 */
export type TablesMode = "basic" | "standard" | "advanced";
export type TablesView = "grid" | "spatial";

const MODE_KEY = "nebula_tables_mode_v2";
const VIEW_KEY = "nebula_tables_view";

function readMode(): TablesMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "basic" || v === "standard" || v === "advanced") return v;
  } catch { /* ignore */ }
  return "standard";
}

function readView(): TablesView {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === "grid" || v === "spatial") return v;
  } catch { /* ignore */ }
  return "grid";
}

interface TablesUiState {
  mode:    TablesMode;
  view:    TablesView;
  setMode: (mode: TablesMode) => void;
  setView: (view: TablesView) => void;
  toggleView: () => void;
}

export const useTablesUiStore = create<TablesUiState>((set) => ({
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

  toggleView: () =>
    set((s) => {
      const next: TablesView = s.view === "grid" ? "spatial" : "grid";
      try { localStorage.setItem(VIEW_KEY, next); } catch { /**/ }
      return { view: next };
    }),
}));

// ── Alias legacy para que el salonUiStore siga compilando ────────
// (OrdersPage y SalonFlowTutorial aún usan useSalonUiStore)
export { useTablesUiStore as useTablesStore };
