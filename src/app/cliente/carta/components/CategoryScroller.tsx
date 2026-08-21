"use client";

import { memo, useRef } from "react";
import type { MenuCategory } from "@/hooks/useMenu";
import styles from "./CategoryScroller.module.css";

// ─────────────────────────────────────────────────────────────────
// CategoryScroller — scroll horizontal mobile-first
// Categoría activa siempre visible
// ─────────────────────────────────────────────────────────────────

interface CategoryScrollerProps {
  categories: MenuCategory[];
  activeCategory: string;
  onSelect: (cat: string) => void;
  totalCount: number;
}

export const CategoryScroller = memo(function CategoryScroller({
  categories,
  activeCategory,
  onSelect,
  totalCount,
}: CategoryScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    onSelect(value);
    // Scroll el botón activo a la vista
    const btn = scrollRef.current?.querySelector(`[data-cat="${value}"]`) as HTMLElement | null;
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  if (categories.length === 0) return null;

  return (
    <div className={styles.wrapper} role="navigation" aria-label="Categorías del menú">
      <div className={styles.scroller} ref={scrollRef}>
        {/* Todos */}
        <button
          type="button"
          data-cat="all"
          className={`${styles.pill} ${activeCategory === "all" ? styles.pillActive : ""}`}
          onClick={() => handleSelect("all")}
          aria-pressed={activeCategory === "all"}
        >
          <span className={styles.pillLabel}>Todo</span>
          <span className={styles.pillCount}>{totalCount}</span>
        </button>

        {/* Categorías reales */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            data-cat={cat.name}
            className={`${styles.pill} ${
              activeCategory.toLowerCase() === cat.name.toLowerCase()
                ? styles.pillActive
                : ""
            }`}
            onClick={() => handleSelect(cat.name)}
            aria-pressed={activeCategory.toLowerCase() === cat.name.toLowerCase()}
          >
            <span className={styles.pillLabel}>{cat.name}</span>
            <span className={styles.pillCount}>{cat.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
