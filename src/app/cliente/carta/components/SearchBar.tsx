"use client";

import { memo, useRef } from "react";
import type { MenuSortBy } from "@/hooks/useMenu";
import styles from "./SearchBar.module.css";

// ─────────────────────────────────────────────────────────────────
// SearchBar — búsqueda + sort en una sola barra
// ─────────────────────────────────────────────────────────────────

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  sortBy: MenuSortBy;
  onSortChange: (s: MenuSortBy) => void;
  resultCount: number;
}

const SORT_OPTIONS: { value: MenuSortBy; label: string }[] = [
  { value: "featured",   label: "Destacados" },
  { value: "name",       label: "Nombre A-Z" },
  { value: "price-asc",  label: "Precio ↑" },
  { value: "price-desc", label: "Precio ↓" },
];

export const SearchBar = memo(function SearchBar({
  query,
  onQueryChange,
  sortBy,
  onSortChange,
  resultCount,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.wrapper}>
      {/* Campo de búsqueda */}
      <div className={styles.searchField}>
        {/* Icono lupa */}
        <svg
          className={styles.searchIcon}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar en la carta…"
          className={styles.input}
          aria-label="Buscar productos"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Contador de resultados */}
        {query.trim() && (
          <span className={styles.counter} aria-live="polite">
            {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
          </span>
        )}

        {/* Botón limpiar */}
        {query && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}
            aria-label="Limpiar búsqueda"
          >
            <svg viewBox="0 0 24 24" fill="none" className={styles.clearIcon} aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Sort selector */}
      <div className={styles.sortWrapper}>
        <svg
          className={styles.sortIcon}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as MenuSortBy)}
          className={styles.sortSelect}
          aria-label="Ordenar productos"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});
