"use client";

import { Search, X, Filter } from "lucide-react";
import styles from "@/styles/recipes/RecipesFiltersV2.module.css";

/* =========================
   PROPS
========================= */
interface RecipesFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories: string[];
}

/* =========================
   NORMALIZER
========================= */
const normalize = (v: string) =>
  (v || "").toLowerCase().trim();

export default function RecipesFilters({
  search,
  setSearch,
  category,
  setCategory,
  categories,
}: RecipesFiltersProps) {
  const safeCategories = Array.isArray(categories)
    ? categories
    : [];

  return (
    <div className={styles.container}>
      {/* ================= SEARCH ================= */}
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={18} />

        <input
          type="text"
          placeholder="Buscar cocktail..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search.length > 0 && (
          <button
            onClick={() => setSearch("")}
            className={styles.clearButton}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ================= FILTERS ================= */}
      <div className={styles.filtersWrapper}>
        <div className={styles.label}>
          <Filter size={16} />
          <span>Filters</span>
        </div>

        <div className={styles.categories}>
          {/* ALL BUTTON (SIEMPRE PRESENTE) */}
          <button
            onClick={() => setCategory("all")}
            className={`${styles.categoryButton} ${
              normalize(category) === "all"
                ? styles.active
                : ""
            }`}
          >
            ALL
          </button>

          {/* CATEGORIES */}
          {safeCategories
            .filter((c) => c && c !== "all")
            .map((cat) => {
              const isActive =
                normalize(category) === normalize(cat);

              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`${styles.categoryButton} ${
                    isActive ? styles.active : ""
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}