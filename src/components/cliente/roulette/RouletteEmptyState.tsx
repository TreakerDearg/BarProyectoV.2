"use client";

import Link from "next/link";
import { memo } from "react";
import styles from "./RouletteEmptyState.module.css";

// ─────────────────────────────────────────────────────────────────
// RouletteEmptyState
// Se muestra cuando no hay tragos configurados en la ruleta.
// ─────────────────────────────────────────────────────────────────

export const RouletteEmptyState = memo(function RouletteEmptyState() {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      {/* Rueda vacía decorativa */}
      <div className={styles.iconWrapper} aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none" className={styles.icon}>
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="rgba(255,90,31,0.18)"
            strokeWidth="2.5"
            strokeDasharray="10 5"
          />
          <circle
            cx="40"
            cy="40"
            r="20"
            stroke="rgba(255,90,31,0.1)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <circle cx="40" cy="40" r="9" fill="rgba(255,90,31,0.12)" />
          <circle
            cx="40"
            cy="40"
            r="9"
            stroke="rgba(255,90,31,0.25)"
            strokeWidth="1.5"
          />
          <text
            x="40"
            y="45"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="rgba(255,90,31,0.4)"
            fontFamily="Outfit, sans-serif"
          >
            ?
          </text>
        </svg>
      </div>

      <h2 className={styles.heading}>Sin opciones disponibles</h2>

      <p className={styles.description}>
        No hay tragos configurados en la ruleta por el momento.
        <br />
        Volvé más tarde y probá tu suerte.
      </p>

      {/* Alternativa real: ir a la carta */}
      <Link href="/cliente/carta" className={styles.ctaLink}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={styles.ctaIcon}
          aria-hidden="true"
        >
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Ver carta
      </Link>
    </div>
  );
});
