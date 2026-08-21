"use client";

import { memo } from "react";
import type { RoulettePhase } from "@/hooks/useRoulette";
import styles from "./RouletteStatus.module.css";

// ─────────────────────────────────────────────────────────────────
// RouletteStatus
// Texto de ayuda contextual que cambia según la fase.
// Comunica lo que está pasando sin requerir que el usuario
// entienda la mecánica interna.
// ─────────────────────────────────────────────────────────────────

interface RouletteStatusProps {
  phase: RoulettePhase;
  winnerName?: string;
}

const STATUS_CONTENT: Record<
  RoulettePhase,
  { text: string; secondary?: string }
> = {
  loading:   { text: "Preparando la ruleta…" },
  idle:      { text: "¿Te animás?", secondary: "Presioná para descubrir tu próximo trago" },
  spinning:  { text: "Girando…", secondary: "El destino está en juego" },
  revealing: { text: "Frenando…", secondary: "El resultado está por llegar" },
  result:    { text: "¡Tenés tu trago!", secondary: "" },
  error:     { text: "Algo salió mal", secondary: "Podés intentarlo de nuevo" },
  empty:     { text: "Sin opciones disponibles", secondary: "Volvé más tarde" },
};

export const RouletteStatus = memo(function RouletteStatus({
  phase,
  winnerName,
}: RouletteStatusProps) {
  const content =
    phase === "result" && winnerName
      ? { text: winnerName, secondary: "¡Una excelente elección para esta noche!" }
      : STATUS_CONTENT[phase];

  const isResult = phase === "result";
  const isSpinning = phase === "spinning" || phase === "revealing";

  return (
    <div
      className={styles.status}
      aria-live="polite"
      aria-atomic="true"
    >
      <p
        className={`${styles.primary} ${isResult ? styles.primaryResult : ""} ${
          isSpinning ? styles.primarySpinning : ""
        }`}
      >
        {content.text}
      </p>

      {content.secondary && (
        <p className={styles.secondary}>{content.secondary}</p>
      )}
    </div>
  );
});
