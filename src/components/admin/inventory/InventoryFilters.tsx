"use client";

import { Search, X } from "lucide-react";
import styles from "@/styles/inventory/InventoryFilters.module.css";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories?: string[];
}

export default function InventoryFilters({
  search,
  setSearch,
  category,
  setCategory,
  categories = [
    "all",
    "Alcohol Base",
    "Mixers",
    "Frutas",
    "Endulzantes",
    "Garnish",
    "Otros",
  ],
}: Props) {
  return (
    <div className={styles.container}>
      {/* BUSCADOR */}
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={18} />

        <input
          type="text"
          placeholder="Buscar ingrediente..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            className={styles.clearButton}
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* FILTROS DE CATEGORÍA */}
      <div className={styles.categories}>
        {categories.map((cat) => {
          const isActive = category === cat;

          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`${styles.categoryButton} ${
                isActive ? styles.activeCategory : ""
              }`}
            >
              {cat.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}