"use client";

import styles from "@/styles/inventory/InventoryCard.module.css";

import {
  deleteItem,
  updateItem,
  InventoryItem,
} from "@/services/inventoryService";

import CardContainer from "./CardComps/CardContainer";
import CardHeader from "./CardComps/CardHeader";
import CardFooter from "./CardComps/CardFooter";
import StockProgressBar from "./CardComps/StockProgressBar";
import { getStockStatus } from "./CardComps/cardStyles";

interface InventoryCardProps {
  item: InventoryItem & { maxStock?: number };
  refresh: () => void;
  onEdit: (item: InventoryItem) => void;
}

export default function InventoryCard({
  item,
  refresh,
  onEdit,
}: InventoryCardProps) {
  const maxStock = item.maxStock || 100;
  const percentage = Math.min(
    (item.stock / maxStock) * 100,
    100
  );

  const status = getStockStatus(item.stock);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar ${item.name}?`)) return;
    await deleteItem(item._id);
    refresh();
  };

  const handleRefill = async () => {
    const amount = prompt("Cantidad a añadir:");
    if (!amount) return;

    const value = Number(amount);
    if (isNaN(value) || value <= 0) return;

    await updateItem(item._id, {
      stock: item.stock + value,
    });

    refresh();
  };

  return (
    <CardContainer status={status}>
      <CardHeader
        item={item}
        status={status}
        onEdit={onEdit}
        onDelete={handleDelete}
      />

      <p className={styles.category}>{item.category}</p>

      <p className={styles.stock}>
        {item.stock}{" "}
        <span className={styles.unit}>{item.unit}</span>
      </p>

      <StockProgressBar
        percentage={percentage}
        status={status}
      />

      <CardFooter
        status={status}
        onRefill={handleRefill}
      />
    </CardContainer>
  );
}