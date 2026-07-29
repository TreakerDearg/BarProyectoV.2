"use client";

import { Info, Dice3, TrendingUp } from "lucide-react";
import { memo } from "react";
import type { RouletteDrinkRow } from "@/lib/types/api";
import styles from "./RouletteInfo.module.css";

interface RouletteInfoProps {
  drinks: RouletteDrinkRow[];
  lastWin?: string;
}

export const RouletteInfo = memo(function RouletteInfo({ drinks, lastWin }: RouletteInfoProps) {
  const totalDrinks = drinks.length;
  const avgProbability = drinks.length > 0
    ? drinks.reduce((sum, d) => sum + (d.probability ?? 0), 0) / drinks.length
    : 0;

  return (
    <div className={styles.info}>
      <div className={styles.infoHeader}>
        <Info className={styles.infoHeaderIcon} />
        <h3 className={styles.infoHeaderTitle}>Información</h3>
      </div>

      <div className={styles.infoContent}>
        <div className={styles.infoStat}>
          <div className={styles.infoStatIcon}>
            <Dice3 />
          </div>
          <div className={styles.infoStatContent}>
            <span className={styles.infoStatValue}>{totalDrinks}</span>
            <span className={styles.infoStatLabel}>Tragos disponibles</span>
          </div>
        </div>

        <div className={styles.infoStat}>
          <div className={styles.infoStatIcon}>
            <TrendingUp />
          </div>
          <div className={styles.infoStatContent}>
            <span className={styles.infoStatValue}>{avgProbability.toFixed(1)}%</span>
            <span className={styles.infoStatLabel}>Probabilidad promedio</span>
          </div>
        </div>

        {lastWin && (
          <div className={styles.infoMessage}>
            <span className={styles.infoMessageLabel}>Último ganado:</span>
            <span className={styles.infoMessageValue}>{lastWin}</span>
          </div>
        )}

        <div className={styles.infoTip}>
          <span className={styles.infoTipIcon}>💡</span>
          <span className={styles.infoTipText}>
            Cada trago tiene la misma probabilidad de salir. ¡La suerte está de tu lado!
          </span>
        </div>
      </div>
    </div>
  );
});
