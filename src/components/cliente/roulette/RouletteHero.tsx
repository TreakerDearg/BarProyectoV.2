"use client";

import { memo } from "react";
import styles from "./RouletteHero.module.css";

// ─────────────────────────────────────────────────────────────────
// RouletteHero
// Introducción concisa que contextualiza la experiencia.
// No ocupa demasiado espacio: la rueda debe convertirse rápidamente
// en el foco visual.
// ─────────────────────────────────────────────────────────────────

interface RouletteHeroProps {
  totalDrinks: number;
}

export const RouletteHero = memo(function RouletteHero({
  totalDrinks,
}: RouletteHeroProps) {
  return (
    <div className={styles.hero}>
      {/* Badge */}
      <div className={styles.badge} aria-hidden="true">
        <span className={styles.badgeDot} />
        <span className={styles.badgeText}>Ruleta Nebula</span>
      </div>

      {/* Heading */}
      <h1 className={styles.heading}>
        ¿No sabés{" "}
        <span className={styles.headingAccent}>qué pedir?</span>
      </h1>

      {/* Subheading */}
      <p className={styles.subheading}>
        Dejá que la ruleta elija por vos.{" "}
        {totalDrinks > 0 && (
          <span className={styles.subheadingCount}>
            {totalDrinks} opciones disponibles esta noche.
          </span>
        )}
      </p>
    </div>
  );
});
