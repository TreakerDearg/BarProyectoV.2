"use client";

import {
  Martini,
  DollarSign,
  Layers,
  PlusCircle,
} from "lucide-react";
import styles from "@/styles/products/ProductsHeader.module.css";

interface Metrics {
  total: number;
  categories: number;
  averagePrice: string | number;
  highestPrice: number;
}

interface ProductsHeaderProps {
  metrics: Metrics;
  onAdd: () => void;
}

export default function ProductsHeader({
  metrics,
  onAdd,
}: ProductsHeaderProps) {
  const cards = [
    {
      title: "TOTAL DE CÓCTELES",
      value: metrics.total,
      icon: <Martini size={22} />,
      color: "cyan",
    },
    {
      title: "CATEGORÍAS",
      value: metrics.categories,
      icon: <Layers size={22} />,
      color: "purple",
    },
    {
      title: "PRECIO PROMEDIO",
      value: `$${metrics.averagePrice}`,
      icon: <DollarSign size={22} />,
      color: "green",
    },
    {
      title: "PRECIO MÁXIMO",
      value: `$${metrics.highestPrice}`,
      icon: <DollarSign size={22} />,
      color: "yellow",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Título y botón */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>MENÚ DE CÓCTELES</h1>
          <p className={styles.subtitle}>
            Gestiona y diseña las bebidas de tu bar
          </p>
        </div>

        <button className={styles.addButton} onClick={onAdd}>
          <PlusCircle size={18} />
          NUEVO CÓCTEL
        </button>
      </div>

      {/* Tarjetas de métricas */}
      <div className={styles.metricsGrid}>
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${styles.metricCard} ${
              styles[card.color]
            }`}
          >
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>
                {card.title}
              </span>
              <span className={styles.metricIcon}>
                {card.icon}
              </span>
            </div>
            <h2 className={styles.metricValue}>
              {card.value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}