import { create } from "zustand";
import type { Product } from "../../../types/product";

// ── Tipos ─────────────────────────────────────────────────────────

/** simple = imagen + nombre + precio
 *  standard = + descripción + margen + tags
 *  advanced = todo — receta, restricciones, menús */
export type ProductMode = "simple" | "standard" | "advanced";
export type ProductView = "grid" | "list";
export type ProductPageView = "list" | "form";

const MODE_KEY = "nebula_product_mode_v2";
const VIEW_KEY = "nebula_product_view";
const CAT_KEY  = "nebula_product_cat";

// ── Estado ────────────────────────────────────────────────────────

interface ProductUiState {
  mode:             ProductMode;
  view:             ProductView;
  pageView:         ProductPageView;
  selectedProduct:  Product | null;
  isDrawerOpen:     boolean;
  /** Categoría activa para filtrar — "" = todas */
  activeCategory:   string;

  setMode:            (mode: ProductMode) => void;
  setView:            (view: ProductView) => void;
  toggleView:         () => void;
  setPageView:        (view: ProductPageView) => void;
  setSelectedProduct: (product: Product | null) => void;
  openDrawer:         (product: Product) => void;
  closeDrawer:        () => void;
  toggleDrawer:       () => void;
  setActiveCategory:  (cat: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function stored<T extends string>(key: string, allowed: T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    if (v && allowed.includes(v)) return v;
  } catch { /* ignore */ }
  return fallback;
}

// ── Store ─────────────────────────────────────────────────────────

export const useProductUiStore = create<ProductUiState>((set) => ({
  mode:            stored(MODE_KEY, ["simple", "standard", "advanced"], "standard"),
  view:            stored(VIEW_KEY, ["grid", "list"], "grid"),
  pageView:        "list",
  selectedProduct: null,
  isDrawerOpen:    false,
  activeCategory:  (() => { try { return localStorage.getItem(CAT_KEY) || ""; } catch { return ""; } })(),

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
      const next: ProductView = s.view === "grid" ? "list" : "grid";
      try { localStorage.setItem(VIEW_KEY, next); } catch { /**/ }
      return { view: next };
    }),

  setPageView:        (pageView)  => set({ pageView }),
  setSelectedProduct: (p)         => set({ selectedProduct: p }),
  openDrawer:         (product)   => set({ selectedProduct: product, isDrawerOpen: true }),
  closeDrawer:        ()          => set({ isDrawerOpen: false, selectedProduct: null }),
  toggleDrawer:       ()          =>
    set((s) => ({
      isDrawerOpen:    !s.isDrawerOpen,
      selectedProduct: s.isDrawerOpen ? null : s.selectedProduct,
    })),

  setActiveCategory: (cat) => {
    try { localStorage.setItem(CAT_KEY, cat); } catch { /**/ }
    set({ activeCategory: cat });
  },
}));
