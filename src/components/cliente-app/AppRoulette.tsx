"use client";

import { Gift, RotateCw } from "lucide-react";
import { useRoulette } from "@/hooks/useRoulette";
import styles from "./AppRoulette.module.css";

export function AppRoulette() {
  const { phase, drinks, result, error, isAddingToCart, spin, onAnimationComplete, addToCart, spinAgain, retry } = useRoulette();
  const spinning = phase === "spinning" || phase === "revealing";

  if (phase === "loading") return <p>Cargando sorpresas...</p>;
  if (phase === "error" && !drinks.length) return <div className={styles.error}><p>{error ?? "No se pudo cargar la ruleta."}</p><button className={styles.add} type="button" onClick={retry}>Reintentar</button></div>;
  if (!drinks.length) return <p>No hay bebidas configuradas para la ruleta.</p>;

  return (
    <div>
      <div className={styles.wheelWrap}>
        <span className={styles.pointer} aria-hidden="true" />
        <div className={`${styles.wheel} ${phase === "spinning" ? styles.wheelSpinning : ""} ${phase === "revealing" ? styles.wheelRevealing : ""}`} onTransitionEnd={onAnimationComplete} style={result?.targetAngle ? { "--target-angle": `${result.targetAngle}deg` } as React.CSSProperties : undefined}>
          <div className={styles.segmentLabels}><span className={styles.segmentLabel}>Sorpresa</span><span className={styles.segmentLabel} style={{ transform: "translateX(-50%) rotate(180deg)" }}>Nebula</span></div>
        </div>
        <span className={styles.center}><Gift size={22} aria-hidden="true" /></span>
      </div>
      {result?.drink && (
        <div className={styles.result} role="status"><span>Tu elección</span><strong>{result.drink.name}</strong><button type="button" className={styles.add} onClick={addToCart} disabled={isAddingToCart}>{isAddingToCart ? "Agregando..." : "Agregar al pedido"}</button><button type="button" className={styles.add} onClick={spinAgain}>Girar de nuevo</button></div>
      )}
      {!result && <button type="button" className={styles.spin} onClick={spin} disabled={spinning}><RotateCw size={17} /> {spinning ? "Girando..." : "Girar la ruleta"}</button>}
    </div>
  );
}
