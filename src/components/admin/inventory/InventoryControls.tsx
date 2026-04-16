"use client";

import { ArrowUpDown } from "lucide-react";
import styles from "@/styles/inventory/InventoryControls.module.css";

interface Props {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
}

export default function InventoryControls({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.sortGroup}>
        <ArrowUpDown size={16} className={styles.icon} />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.select}
        >
          <option value="name">Nombre</option>
          <option value="stock">Stock</option>
          <option value="category">Categoría</option>
        </select>

        <button
          className={styles.orderButton}
          onClick={() =>
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
          }
        >
          {sortOrder === "asc" ? "Ascendente ↑" : "Descendente ↓"}
        </button>
      </div>
    </div>
  );
}