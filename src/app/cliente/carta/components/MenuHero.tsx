"use client";

import { memo } from "react";
import styles from "./MenuHero.module.css";

// ─────────────────────────────────────────────────────────────────
// MenuHero — introducción compacta de la carta
// Sin stats hardcodeadas. Solo título + descripción real.
// ─────────────────────────────────────────────────────────────────

interface MenuHeroProps {
  totalProducts: number;
  totalCategories: number;
}

export const MenuHero = memo(function MenuHero({
  totalProducts,
  totalCategories,
}: MenuHeroProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.heroBackground} aria-hidden="true" />

      <div className={styles.heroContent}>
        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          <span>Carta de Nebula</span>
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>
          Nuestra <span className={styles.headingAccent}>Carta</span>
        </h1>

        {/* Descripción */}
        <p className={styles.description}>
          Descubrí lo que preparamos para vos esta noche.
          {totalCategories > 0 && totalProducts > 0 && (
            <span className={styles.stats}>
              {" "}
              {totalProducts} {totalProducts === 1 ? "producto" : "productos"} en{" "}
              {totalCategories}{" "}
              {totalCategories === 1 ? "categoría" : "categorías"}.
            </span>
          )}
        </p>
      </div>
    </div>
  );
});
