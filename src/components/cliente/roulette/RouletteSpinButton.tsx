"use client";

import { memo } from "react";
import type { RoulettePhase } from "@/hooks/useRoulette";
import styles from "./RouletteSpinButton.module.css";

// ─────────────────────────────────────────────────────────────────
// RouletteSpinButton
// CTA principal de la experiencia. Cambia de estado según la fase.
// ─────────────────────────────────────────────────────────────────

interface RouletteSpinButtonProps {
  phase: RoulettePhase;
  onSpin: () => void;
}

const LABEL_MAP: Partial<Record<RoulettePhase, string>> = {
  idle:      "¡GIRÁ!",
  spinning:  "Girando…",
  revealing: "Girando…",
  result:    "Girar de nuevo",
  error:     "Reintentar",
};

const isDisabled = (phase: RoulettePhase): boolean =>
  phase === "spinning" || phase === "revealing" || phase === "loading";

export const RouletteSpinButton = memo(function RouletteSpinButton({
  phase,
  onSpin,
}: RouletteSpinButtonProps) {
  const disabled = isDisabled(phase);
  const label = LABEL_MAP[phase] ?? "¡GIRÁ!";
  const isActive = phase === "spinning" || phase === "revealing";

  return (
    <button
      type="button"
      className={`${styles.button} ${isActive ? styles.buttonSpinning : ""} ${
        phase === "result" ? styles.buttonAgain : ""
      }`}
      onClick={onSpin}
      disabled={disabled}
      aria-label={label}
      aria-busy={isActive}
    >
      {/* Icono de giro */}
      <span
        className={`${styles.icon} ${isActive ? styles.iconSpin : ""}`}
        aria-hidden="true"
      >
        {isActive ? (
          /* Spinner ring */
          <svg viewBox="0 0 24 24" fill="none" className={styles.iconSvg}>
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="40 20"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          /* Flecha de giro */
          <svg viewBox="0 0 24 24" fill="none" className={styles.iconSvg}>
            <path
              d="M21 12a9 9 0 01-9 9m0 0a9 9 0 01-9-9m9 9V3m0 0L8 6m4-3l4 3"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      <span className={styles.label}>{label}</span>
    </button>
  );
});
