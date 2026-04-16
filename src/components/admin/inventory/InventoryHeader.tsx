"use client";

import {
  Package,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import styles from "@/styles/inventory/InventoryHeader.module.css";

interface InventoryHeaderProps {
  totalItems?: number;
  criticalItems?: number;
  lowStockItems?: number;
  optimalItems?: number;
}

export default function InventoryHeader({
  totalItems = 0,
  criticalItems = 0,
  lowStockItems = 0,
  optimalItems = 0,
}: InventoryHeaderProps) {
  const cards = [
    {
      title: "TOTAL INGREDIENTES",
      value: totalItems,
      icon: <Package size={22} />,
      color: "cyan",
    },
    {
      title: "STOCK CRÍTICO",
      value: criticalItems,
      icon: <AlertTriangle size={22} />,
      color: "red",
    },
    {
      title: "STOCK BAJO",
      value: lowStockItems,
      icon: <TrendingDown size={22} />,
      color: "yellow",
    },
    {
      title: "STOCK ÓPTIMO",
      value: optimalItems,
      icon: <CheckCircle size={22} />,
      color: "green",
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>INVENTARIO</h1>

      <div className={styles.grid}>
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${styles.card} ${styles[card.color]}`}
          >
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>{card.title}</p>
              <span className={styles.icon}>{card.icon}</span>
            </div>

            <h2 className={styles.cardValue}>{card.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}