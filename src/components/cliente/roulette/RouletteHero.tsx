"use client";

import { memo } from "react";
import styles from "./RouletteHero.module.css";

interface RouletteHeroProps {
  totalDrinks: number;
}

export const RouletteHero = memo(function RouletteHero({ totalDrinks }: RouletteHeroProps) {
  return (
    <div className={styles.hero}>
      {/* Badge con rareza indicator */}
      <div className={styles.badge} aria-hidden="true">
        <span className={styles.badgeDot} />
        <span className={styles.badgeText}>Ruleta Nebula</span>
        <span className={styles.badgeSeparator} aria-hidden="true">·</span>
        <span className={styles.badgeRarity}>EPIC · RARE · LEGENDARY</span>
      </div>

      {/* Heading principal */}
      <h1 className={styles.heading}>
        ¿No sabés{" "}
        <em className={styles.headingAccent}>qué pedir?</em>
      </h1>

      {/* Subheading */}
      <p className={styles.subheading}>
        Dejá que el destino elija tu próximo trago.
        {totalDrinks > 0 && (
          <span className={styles.subheadingCount}>
            {" "}{totalDrinks} opciones disponibles.
          </span>
        )}
      </p>

      {/* Indicadores de rareza */}
      <div className={styles.rarityRow} aria-label="Sistema de rarezas disponibles">
        <span className={styles.rarityPill} data-rarity="common">Clásico</span>
        <span className={styles.rarityDivider} aria-hidden="true" />
        <span className={styles.rarityPill} data-rarity="rare">Raro</span>
        <span className={styles.rarityDivider} aria-hidden="true" />
        <span className={styles.rarityPill} data-rarity="epic">Épico</span>
        <span className={styles.rarityDivider} aria-hidden="true" />
        <span className={styles.rarityPill} data-rarity="legendary">Legendario</span>
      </div>
    </div>
  );
});
