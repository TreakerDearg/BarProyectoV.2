"use client";

import { useEffect } from "react";
import { ArrowUpDown } from "lucide-react";
import styles from "@/styles/products/ProductsControls.module.css";

interface ProductsControlsProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
}

export default function ProductsControls({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: ProductsControlsProps) {
  /* ================================
     CARGAR DESDE LOCAL STORAGE
  ================================= */
  useEffect(() => {
    const savedSortBy = localStorage.getItem("products_sortBy");
    const savedSortOrder = localStorage.getItem("products_sortOrder");

    if (
      savedSortBy &&
      ["name", "price", "category"].includes(savedSortBy)
    ) {
      setSortBy(savedSortBy);
    }

    if (
      savedSortOrder === "asc" ||
      savedSortOrder === "desc"
    ) {
      setSortOrder(savedSortOrder);
    }
  }, [setSortBy, setSortOrder]);

  /* ================================
     GUARDAR EN LOCAL STORAGE
  ================================= */
  useEffect(() => {
    localStorage.setItem("products_sortBy", sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem("products_sortOrder", sortOrder);
  }, [sortOrder]);

  /* ================================
     CAMBIAR ORDEN
  ================================= */
  const toggleOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <label className={styles.label}>Ordenar por:</label>

        <select
          className={styles.select}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Nombre</option>
          <option value="price">Precio</option>
          <option value="category">Categoría</option>
        </select>

        <button
          className={styles.orderButton}
          onClick={toggleOrder}
          title="Cambiar orden"
        >
          <ArrowUpDown size={18} />
          {sortOrder === "asc" ? "Ascendente" : "Descendente"}
        </button>
      </div>
    </div>
  );
}