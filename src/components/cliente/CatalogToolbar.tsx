"use client";

import { Search, UtensilsCrossed, Wine, X } from "lucide-react";
import clsx from "clsx";
import ui from "@/app/cliente/cliente-ui.module.css";

export type ProductTypeFilter = "all" | "food" | "drink";

type CatalogToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: ProductTypeFilter;
  onTypeFilterChange: (value: ProductTypeFilter) => void;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
  resultCount: number;
  cartCount?: number;
};

const FILTER_OPTIONS: Array<{
  value: ProductTypeFilter;
  label: string;
  icon?: typeof UtensilsCrossed;
}> = [
  { value: "all", label: "Todo" },
  { value: "food", label: "Comidas", icon: UtensilsCrossed },
  { value: "drink", label: "Bebidas", icon: Wine },
];

export function CatalogToolbar({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  categories,
  selectedCategory,
  onCategoryChange,
  resultCount,
  cartCount,
}: CatalogToolbarProps) {
  return (
    <section className={ui.catalogToolbar} aria-label="Controles del catálogo">
      <div className={ui.catalogTopRow}>
        <div className={ui.searchWrap}>
          <Search className={clsx("h-4 w-4", ui.searchIcon)} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por nombre o descripción…"
            className={ui.searchInput}
            aria-label="Buscar productos"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className={ui.searchClear}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={ui.toolbarMeta}>
            Resultados
            <span className={ui.metaBadgeStrong}>{resultCount}</span>
          </span>
          {typeof cartCount === "number" && (
            <span className={ui.toolbarMeta}>
              Carrito
              <span className={ui.metaBadgeStrong}>{cartCount}</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className={ui.pillGroup} role="tablist" aria-label="Filtrar por tipo">
          {FILTER_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = typeFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTypeFilterChange(option.value)}
                className={active ? ui.pillCompactActive : ui.pillCompact}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
                {option.label}
              </button>
            );
          })}
        </div>

        {categories && categories.length > 0 && onCategoryChange ? (
          <div className={ui.categoryRail} aria-label="Categorías">
            <button
              type="button"
              onClick={() => onCategoryChange("all")}
              className={
                selectedCategory === "all"
                  ? ui.categoryBtnActive
                  : ui.categoryBtn
              }
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={
                  selectedCategory === category
                    ? ui.categoryBtnActive
                    : ui.categoryBtn
                }
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
