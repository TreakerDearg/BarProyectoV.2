"use client";

import { Plus, BookOpen, Martini, Package } from "lucide-react";
import styles from "@/styles/recipes/RecipesHeader.module.css";

interface Metrics {
  total: number;
  cocktails: number;
  ingredients: number;
  categories: number;
}

interface RecipesHeaderProps {
  metrics: Metrics;
  onAdd: () => void;
}

export default function RecipesHeader({
  metrics,
  onAdd,
}: RecipesHeaderProps) {
  const cards = [
    {
      title: "RECETAS",
      value: metrics.total,
      icon: <BookOpen size={22} />,
      color: "cyan",
    },
    {
      title: "CÓCTELES",
      value: metrics.cocktails,
      icon: <Martini size={22} />,
      color: "purple",
    },
    {
      title: "INGREDIENTES",
      value: metrics.ingredients,
      icon: <Package size={22} />,
      color: "green",
    },
    {
      title: "CATEGORÍAS",
      value: metrics.categories,
      icon: <Martini size={22} />,
      color: "orange",
    },
  ];

  return (
    <div className={styles.container}>
      {/* TITULO Y BOTÓN */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>GESTOR DE RECETAS</h1>
          <p className={styles.subtitle}>
            Administra y diseña cócteles con precisión profesional.
          </p>
        </div>

        <button className={styles.addButton} onClick={onAdd}>
          <Plus size={18} />
          NUEVA RECETA
        </button>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
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
              <span className={styles.icon}>{card.icon}</span>
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