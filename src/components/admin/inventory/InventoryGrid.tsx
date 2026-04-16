"use client";

import InventoryCard from "./InventoryCard";
import { InventoryItem } from "@/services/inventoryService";
import styles from "@/styles/inventory/InventoryGrid.module.css";

interface InventoryGridProps {
  items?: InventoryItem[];
  refresh: () => void;
  onEdit: (item: InventoryItem) => void;
  loading?: boolean;
}

export default function InventoryGrid({
  items = [],
  refresh,
  onEdit,
  loading = false,
}: InventoryGridProps) {
  // Estado de carga
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  // Estado vacío
  if (!items.length) {
    return (
      <div className={styles.emptyState}>
        <p>No hay elementos en el inventario.</p>
        <span>Agrega un nuevo ingrediente para comenzar.</span>
      </div>
    );
  }

  // Render del grid
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item._id} className={styles.cardWrapper}>
          <InventoryCard
            item={item}
            refresh={refresh}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}