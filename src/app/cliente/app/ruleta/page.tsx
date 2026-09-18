"use client";

import { useRoulette } from "@/hooks/useRoulette";
import { RouletteHero } from "@/components/cliente/roulette/RouletteHero";
import { RouletteWheel } from "@/components/cliente/roulette/RouletteWheel";
import { RouletteSpinButton } from "@/components/cliente/roulette/RouletteSpinButton";
import { RouletteStatus } from "@/components/cliente/roulette/RouletteStatus";
import { RouletteResultModal } from "@/components/cliente/roulette/RouletteResultModal";
import { RouletteEmptyState } from "@/components/cliente/roulette/RouletteEmptyState";
import { RouletteErrorState } from "@/components/cliente/roulette/RouletteErrorState";
import styles from "./page.module.css";

export default function AppRoulettePage() {
  const { phase, drinks, result, isAddingToCart, spin, onAnimationComplete, addToCart, spinAgain, retry, dismissResult } = useRoulette();
  const isModalOpen = phase === "result";
  const isSpinDisabled = phase === "spinning" || phase === "revealing";

  if (phase === "loading") return <main className={styles.page}><div className={styles.loading}>Preparando la sorpresa...</div></main>;
  if (phase === "empty") return <main className={styles.page}><RouletteEmptyState /></main>;
  if (phase === "error" && drinks.length === 0) return <main className={styles.page}><RouletteErrorState onRetry={retry} /></main>;

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Experiencia Nebula</span>
        <h1 className={styles.title}>Deja que la noche elija</h1>
        <p className={styles.description}>Gira la ruleta y descubre una bebida para tu momento.</p>
      </header>
      <section className={styles.experience}>
        <div className={styles.hero}><RouletteHero totalDrinks={drinks.length} /></div>
        <div className={styles.wheel}><RouletteWheel drinks={drinks} phase={phase} targetAngle={result?.targetAngle ?? null} onAnimationComplete={onAnimationComplete} /></div>
        <div className={styles.controls}>
          <RouletteStatus phase={phase} winnerName={result?.drink?.name} winnerRarity={result?.drink?.rarity} />
          <RouletteSpinButton phase={phase} onSpin={isSpinDisabled ? () => {} : spin} />
        </div>
      </section>
      <RouletteResultModal isOpen={isModalOpen} result={result?.drink ?? null} isAdding={isAddingToCart} onAddToCart={addToCart} onSpinAgain={spinAgain} onClose={dismissResult} />
    </main>
  );
}
