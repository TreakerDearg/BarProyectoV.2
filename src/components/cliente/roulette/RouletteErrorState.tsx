"use client";

import { memo } from "react";
import styles from "./RouletteErrorState.module.css";

// ─────────────────────────────────────────────────────────────────
// RouletteErrorState
// Lenguaje humano. No exponer errores técnicos al usuario.
// ─────────────────────────────────────────────────────────────────

interface RouletteErrorStateProps {
  onRetry: () => void;
}

export const RouletteErrorState = memo(function RouletteErrorState({
  onRetry,
}: RouletteErrorStateProps) {
  return (
    <div className={styles.wrapper} role="alert" aria-live="assertive">
      {/* Icono */}
      <div className={styles.iconWrapper} aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none" className={styles.icon}>
          {/* Triángulo de advertencia estilizado */}
          <circle cx="40" cy="40" r="34" fill="rgba(255,69,58,0.08)" />
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="rgba(255,69,58,0.2)"
            strokeWidth="1.5"
          />
          <path
            d="M40 26v16M40 50v2"
            stroke="#FF453A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M40 54a1 1 0 100 2 1 1 0 000-2z"
            fill="#FF453A"
          />
        </svg>
      </div>

      <h2 className={styles.heading}>No pudimos preparar la ruleta</h2>

      <p className={styles.description}>
        Algo salió mal al cargar las opciones.
        <br />
        Intentá nuevamente en un momento.
      </p>

      <button
        type="button"
        className={styles.retryButton}
        onClick={onRetry}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={styles.retryIcon}
          aria-hidden="true"
        >
          <path
            d="M1 4v6h6M23 20v-6h-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Reintentar
      </button>
    </div>
  );
});
