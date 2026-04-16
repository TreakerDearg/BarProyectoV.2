"use client";

import { useEffect } from "react";
import { Search, X } from "lucide-react";
import styles from "@/styles/products/ProductsFilters.module.css";

interface ProductsFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories: string[];
}

export default function ProductsFilters({
  search,
  setSearch,
  category,
  setCategory,
  categories,
}: ProductsFiltersProps) {
  /* ================================
     CARGAR DESDE LOCAL STORAGE
  ================================= */
  useEffect(() => {
    const savedSearch = localStorage.getItem("products_search");
    const savedCategory = localStorage.getItem("products_category");

    if (savedSearch) setSearch(savedSearch);
    if (savedCategory) setCategory(savedCategory);
  }, [setSearch, setCategory]);

  /* ================================
     GUARDAR EN LOCAL STORAGE
  ================================= */
  useEffect(() => {
    localStorage.setItem("products_search", search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem("products_category", category);
  }, [category]);

  /* ================================
     LIMPIAR FILTROS
  ================================= */
  const handleClear = () => {
    setSearch("");
    setCategory("all");
    localStorage.removeItem("products_search");
    localStorage.removeItem("products_category");
  };

  return (
    <div className={styles.container}>
      {/* BUSCADOR */}
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={18} />

        <input
          type="text"
          placeholder="Buscar cóctel..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            className={styles.clearButton}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div className={styles.filtersContainer}>
        {categories.map((cat) => {
          const isActive = category === cat;

          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`${styles.filterButton} ${
                isActive ? styles.active : ""
              }`}
            >
              {cat.toUpperCase()}
            </button>
          );
        })}

        <button
          onClick={handleClear}
          className={styles.resetButton}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}