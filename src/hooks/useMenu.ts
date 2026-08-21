"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { getPublicProducts } from "@/lib/api/bartender";
import type { ProductPublicDTO } from "@/lib/types/api";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type MenuSortBy = "name" | "price-asc" | "price-desc" | "featured";
export type MenuCategory = { id: string; name: string; count: number };

export interface UseMenuState {
  products: ProductPublicDTO[];
  filteredProducts: ProductPublicDTO[];
  categories: MenuCategory[];
  activeCategory: string;       // "all" o nombre de categoría
  searchQuery: string;
  sortBy: MenuSortBy;
  loading: boolean;
  error: string | null;
  // derived
  hasResults: boolean;
  isFiltered: boolean;
  totalCount: number;
}

export interface UseMenuActions {
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (s: MenuSortBy) => void;
  retry: () => void;
  selectProduct: (product: ProductPublicDTO | null) => void;
  selectedProduct: ProductPublicDTO | null;
}

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

export function useMenu(): UseMenuState & UseMenuActions {
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<MenuSortBy>("featured");
  const [selectedProduct, setSelectedProduct] = useState<ProductPublicDTO | null>(null);

  const aliveRef = useRef(true);

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicProducts();
      if (!aliveRef.current) return;
      setProducts(data);
    } catch (e) {
      if (!aliveRef.current) return;
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo cargar la carta. Intentá nuevamente."
      );
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    fetchProducts();
    return () => {
      aliveRef.current = false;
    };
  }, [fetchProducts]);

  // ── Categorías derivadas ───────────────────────────────────────
  const categories = useMemo<MenuCategory[]>(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (p.available === false) continue;
      const cat = p.category?.trim();
      if (!cat) continue;
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    const sorted = Array.from(map.entries())
      .map(([name, count]) => ({ id: name.toLowerCase(), name, count }))
      .sort((a, b) => b.count - a.count);
    return sorted;
  }, [products]);

  // ── Filtrado y sorting ─────────────────────────────────────────
  const filteredProducts = useMemo<ProductPublicDTO[]>(() => {
    const q = searchQuery.trim().toLowerCase();

    let result = products.filter((p) => {
      // Filtrar por disponibilidad: mostrar todos pero los no disponibles
      // quedarán al final (se ordenan después)

      // Filtrar por categoría
      if (activeCategory !== "all") {
        if (p.category?.toLowerCase() !== activeCategory.toLowerCase()) {
          return false;
        }
      }

      // Filtrar por búsqueda
      if (q) {
        const inName = p.name.toLowerCase().includes(q);
        const inDesc = p.description?.toLowerCase().includes(q) ?? false;
        const inTags = p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        const inCat = p.category?.toLowerCase().includes(q) ?? false;
        return inName || inDesc || inTags || inCat;
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      // Siempre poner los no disponibles al final
      if (a.available !== b.available) {
        return a.available ? -1 : 1;
      }

      switch (sortBy) {
        case "price-asc":
          return (a.dynamicPrice ?? a.price) - (b.dynamicPrice ?? b.price);
        case "price-desc":
          return (b.dynamicPrice ?? b.price) - (a.dynamicPrice ?? a.price);
        case "featured":
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return a.name.localeCompare(b.name, "es");
        case "name":
        default:
          return a.name.localeCompare(b.name, "es");
      }
    });

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  const isFiltered = activeCategory !== "all" || searchQuery.trim().length > 0;
  const hasResults = filteredProducts.length > 0;

  return {
    // state
    products,
    filteredProducts,
    categories,
    activeCategory,
    searchQuery,
    sortBy,
    loading,
    error,
    hasResults,
    isFiltered,
    totalCount: products.length,
    // actions
    setActiveCategory,
    setSearchQuery,
    setSortBy,
    retry: fetchProducts,
    selectedProduct,
    selectProduct: setSelectedProduct,
  };
}
