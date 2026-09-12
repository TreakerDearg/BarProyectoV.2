"use client";

import { memo } from "react";
import type { RoulettePhase } from "@/hooks/useRoulette";
import styles from "./RouletteStatus.module.css";

interface RouletteStatusProps {
  phase: RoulettePhase;
  winnerName?: string;
  winnerRarity?: string;
}

const STATUS_CONTENT: Record<RoulettePhase, { text: string; secondary?: string }> = {
  loading:   { text: "Preparando la ruleta…" },
  idle:      { text: "¿Te animás?",           secondary: "Presioná para descubrir tu próximo trago" },
  spinning:  { text: "Girando…",              secondary: "El destino está en juego" },
  revealing: { text: "Frenando…",             secondary: "El resultado está por llegar" },
  result:    { text: "¡Tenés tu trago!",       secondary: "" },
  error:     { text: "Algo salió mal",         secondary: "Podés intentarlo de nuevo" },
  empty:     { text: "Sin opciones esta noche", secondary: "Volvé más tarde" },
};

const RARITY_SECONDARY: Record<string, string> = {
  COMMON:    "¡Una elección clásica para esta noche!",
  RARE:      "¡Un trago especial te espera!",
  EPIC:      "¡Épico! Un trago de autor te eligió.",
  LEGENDARY: "✨ Legendario — esto pasa muy pocas veces.",
};

export const RouletteStatus = memo(function RouletteStatus({
  phase,
  winnerName,
  winnerRarity,
}: RouletteStatusProps) {
  const rarityKey = (winnerRarity ?? "COMMON").toUpperCase();
  const secondary = RARITY_SECONDARY[rarityKey] ?? RARITY_SECONDARY.COMMON;

  const content =
    phase === "result" && winnerName
      ? { text: winnerName, secondary }
      : STATUS_CONTENT[phase];

  const isResult   = phase === "result";
  const isSpinning = phase === "spinning" || phase === "revealing";
  const isLegendary = isResult && rarityKey === "LEGENDARY";
  const isEpic      = isResult && rarityKey === "EPIC";

  return (
    <div className={styles.status} aria-live="polite" aria-atomic="true">
      <p
        className={`
          ${styles.primary}
          ${isResult   ? styles.primaryResult   : ""}
          ${isSpinning ? styles.primarySpinning : ""}
          ${isLegendary ? styles.primaryLegendary : ""}
          ${isEpic      ? styles.primaryEpic      : ""}
        `.trim()}
      >
        {content.text}
      </p>

      {content.secondary && (
        <p className={`${styles.secondary} ${isLegendary ? styles.secondaryGlow : ""}`}>
          {content.secondary}
        </p>
      )}
    </div>
  );
});
