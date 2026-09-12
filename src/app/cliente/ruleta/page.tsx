"use client";

// ─────────────────────────────────────────────────────────────────
// RulettePage — página principal de la Ruleta del cliente
//
// Layout global (Navbar + Footer) lo provee ClienteShell.
// Esta página solo orquesta la experiencia de la ruleta.
//
// Arquitectura:
//   RulettePage (composición)
//     → useRoulette (estado + lógica + llamadas a API)
//       → RouletteHero   (introducción compacta)
//       → RouletteWheel  (rueda premium + animación determinística)
//       → RouletteStatus (feedback contextual por fase)
//       → RouletteSpinButton (CTA principal)
//       → RouletteResultModal (resultado: bottom-sheet mobile / modal desktop)
//       → RouletteEmptyState (sin tragos configurados)
//       → RouletteErrorState (error de red)
// ─────────────────────────────────────────────────────────────────

import { useRoulette } from "@/hooks/useRoulette";
import { RouletteHero } from "@/components/cliente/roulette/RouletteHero";
import { RouletteWheel } from "@/components/cliente/roulette/RouletteWheel";
import { RouletteSpinButton } from "@/components/cliente/roulette/RouletteSpinButton";
import { RouletteStatus } from "@/components/cliente/roulette/RouletteStatus";
import { RouletteResultModal } from "@/components/cliente/roulette/RouletteResultModal";
import { RouletteEmptyState } from "@/components/cliente/roulette/RouletteEmptyState";
import { RouletteErrorState } from "@/components/cliente/roulette/RouletteErrorState";
import styles from "./Ruleta.module.css";

// ─────────────────────────────────────────────────────────────────
// Skeleton de carga — mientras se obtienen los tragos
// ─────────────────────────────────────────────────────────────────

function RuletteLoadingSkeleton() {
  return (
    <div className={styles.loadingWrapper} aria-label="Cargando ruleta" role="status">
      <div className={styles.skeletonWheel} aria-hidden="true" />
      <div className={styles.skeletonLine} aria-hidden="true" />
      <div className={styles.skeletonButton} aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────

export default function RulettePage() {
  const {
    phase,
    drinks,
    result,
    error: _error,
    isAddingToCart,
    spin,
    onAnimationComplete,
    addToCart,
    spinAgain,
    retry,
    dismissResult,
  } = useRoulette();

  // ── Carga inicial ────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <main className={styles.page}>
        <RuletteLoadingSkeleton />
      </main>
    );
  }

  // ── Sin tragos configurados ──────────────────────────────────
  if (phase === "empty") {
    return (
      <main className={styles.page}>
        <RouletteEmptyState />
      </main>
    );
  }

  // ── Error de carga ───────────────────────────────────────────
  if (phase === "error" && drinks.length === 0) {
    return (
      <main className={styles.page}>
        <RouletteErrorState onRetry={retry} />
      </main>
    );
  }

  // ── Experiencia principal ────────────────────────────────────
  const isModalOpen = phase === "result";
  const isSpinDisabled = phase === "spinning" || phase === "revealing";

  return (
    <main className={styles.page}>
      {/* Fondo decorativo con gradiente radial sutil */}
      <div className={styles.pageBackground} aria-hidden="true" />

      <div className={styles.experience}>
        {/* ── Hero — introducción concisa ──────────────────────*/}
        <RouletteHero totalDrinks={drinks.length} />

        {/* ── Rueda — elemento protagonista ───────────────────*/}
        <div className={styles.wheelSection}>
          <RouletteWheel
            drinks={drinks}
            phase={phase}
            targetAngle={result?.targetAngle ?? null}
            onAnimationComplete={onAnimationComplete}
          />
        </div>

        {/* ── Status + CTA ─────────────────────────────────────*/}
        <div className={styles.controls}>
          <RouletteStatus
            phase={phase}
            winnerName={result?.drink?.name}
            winnerRarity={result?.drink?.rarity}
          />

          <RouletteSpinButton
            phase={phase}
            onSpin={isSpinDisabled ? () => {} : spin}
          />
        </div>
      </div>

      {/* ── Modal de resultado (portal a body implícito via position:fixed) ─*/}
      <RouletteResultModal
        isOpen={isModalOpen}
        result={result?.drink ?? null}
        isAdding={isAddingToCart}
        onAddToCart={addToCart}
        onSpinAgain={spinAgain}
        onClose={dismissResult}
      />
    </main>
  );
}
