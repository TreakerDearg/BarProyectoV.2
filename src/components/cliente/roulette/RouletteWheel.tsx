"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import type { RouletteDrinkRow } from "@/lib/types/api";
import type { RoulettePhase } from "@/hooks/useRoulette";
import styles from "./RouletteWheel.module.css";

// ─────────────────────────────────────────────────────────────────
// Colores premium para la rueda (identidad del sistema)
// Basado en la SKILL bartender-client-design
// ─────────────────────────────────────────────────────────────────
const WHEEL_COLORS = [
  "#FF5A1F", // Primary Orange
  "#1E1E26", // Elevated dark
  "#FFB800", // Secondary Gold
  "#15151B", // Surface dark
  "#B8E52E", // Accent Lime
  "#292932", // Border dark
  "#FF7138", // Orange hover
  "#0B0B0F", // BG
];

function getSegmentColor(drink: RouletteDrinkRow, index: number): string {
  if (drink.color && /^#([0-9A-F]{3}){1,2}$/i.test(drink.color)) {
    return drink.color;
  }
  return WHEEL_COLORS[index % WHEEL_COLORS.length];
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function buildConicGradient(drinks: RouletteDrinkRow[]): string {
  if (!drinks.length) return "conic-gradient(#1E1E26 0deg 360deg)";

  const total = drinks.reduce((s, d) => s + (d.probability ?? 0), 0) || 1;
  let deg = 0;
  const parts: string[] = [];

  for (let i = 0; i < drinks.length; i++) {
    const pct = ((drinks[i].probability ?? 0) / total) * 100;
    const slice = (pct / 100) * 360;
    const color = getSegmentColor(drinks[i], i);
    const a = deg;
    const b = deg + slice;

    // Añadir borde entre segmentos: una línea de 1deg oscura
    if (i > 0) {
      parts.push(`rgba(0,0,0,0.6) ${a}deg ${a + 1}deg`);
      parts.push(`${color} ${a + 1}deg ${b}deg`);
    } else {
      parts.push(`${color} ${a}deg ${b}deg`);
    }

    deg = b;
  }

  return `conic-gradient(from -90deg, ${parts.join(", ")})`;
}

/** Posición angular del centro de cada segmento (0° = top = -90° del conic) */
function buildSegmentAngles(drinks: RouletteDrinkRow[]): number[] {
  const total = drinks.reduce((s, d) => s + (d.probability ?? 0), 0) || 1;
  let deg = 0;
  return drinks.map((d) => {
    const pct = ((d.probability ?? 0) / total) * 100;
    const slice = (pct / 100) * 360;
    const center = deg + slice / 2;
    deg += slice;
    return center;
  });
}

// ─────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────

interface RouletteWheelProps {
  drinks: RouletteDrinkRow[];
  phase: RoulettePhase;
  /** Ángulo exacto en el que debe detenerse la rueda (calculado por useRoulette) */
  targetAngle: number | null;
  onAnimationComplete: () => void;
}

// ─────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────

export const RouletteWheel = memo(function RouletteWheel({
  drinks,
  phase,
  targetAngle,
  onAnimationComplete,
}: RouletteWheelProps) {
  const rotationValue = useMotionValue(0);
  const currentAngleRef = useRef(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Detectar prefers-reduced-motion solo en el cliente
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const gradient = buildConicGradient(drinks);
  const segmentAngles = buildSegmentAngles(drinks);

  // ── Animación de giro ─────────────────────────────────────────
  useEffect(() => {
    if (phase === "spinning") {
      // Fase 1: giro libre mientras esperamos el resultado del backend
      // Giramos 3 vueltas rápidas para dar feedback inmediato al usuario
      const spins = prefersReduced ? 1 : 3;
      const duration = prefersReduced ? 0.6 : 2;
      const from = currentAngleRef.current;
      const to = from + spins * 360;

      animationRef.current?.stop();
      animationRef.current = animate(from, to, {
        duration,
        ease: [0.4, 0, 0.6, 1], // aceleración rápida
        repeat: Infinity,
        repeatType: "loop",
        onUpdate: (v) => {
          rotationValue.set(v);
          currentAngleRef.current = v;
        },
      });
    } else if (phase === "revealing" && targetAngle !== null) {
      // Fase 2: parar exactamente en el segmento ganador
      animationRef.current?.stop();

      // Calculamos desde el ángulo actual hacia el target
      // El targetAngle ya incluye vueltas completas (calculado en useRoulette)
      // Pero debemos ajustar para que sea mayor que el ángulo actual
      const current = currentAngleRef.current % 360;
      const normalizedTarget = targetAngle % 360;
      // Cuántas vueltas completas ya llevamos
      const completedFullRotations = Math.floor(
        currentAngleRef.current / 360
      );
      // Calculamos el ángulo final asegurándonos de avanzar siempre
      // (nunca ir hacia atrás)
      let finalAngle =
        completedFullRotations * 360 +
        normalizedTarget +
        (normalizedTarget < current ? 360 : 0) +
        // Al menos 3 vueltas más para que la desaceleración se vea bien
        3 * 360;

      const remainingDistance = finalAngle - currentAngleRef.current;
      // Si la distancia restante es demasiado corta, sumar más vueltas
      if (remainingDistance < 3 * 360) {
        finalAngle += 3 * 360;
      }

      const duration = prefersReduced
        ? 1
        : Math.min(5, Math.max(3, remainingDistance / 300));

      animationRef.current = animate(
        currentAngleRef.current,
        finalAngle,
        {
          duration,
          ease: [0.15, 0.8, 0.3, 1], // desaceleración dramática con rebote suave
          onUpdate: (v) => {
            rotationValue.set(v);
            currentAngleRef.current = v;
          },
          onComplete: () => {
            onAnimationComplete();
          },
        }
      );
    } else if (phase === "idle" || phase === "result") {
      // Detener cualquier animación en curso
      animationRef.current?.stop();
    }

    return () => {
      animationRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, targetAngle, prefersReduced]);

  // ── Render ────────────────────────────────────────────────────
  const isActive = phase === "spinning" || phase === "revealing";

  return (
    <div
      className={styles.wheelScene}
      role="img"
      aria-label="Ruleta de tragos"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Glow ambiental exterior */}
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div
        className={`${styles.ambientGlowSecondary} ${isActive ? styles.ambientActive : ""}`}
        aria-hidden="true"
      />

      {/* Anillo decorativo exterior */}
      <div className={styles.ringOuter} aria-hidden="true" />
      <div className={styles.ringInner} aria-hidden="true" />

      {/* Contenedor de la rueda */}
      <div className={styles.wheelWrapper}>
        {/* La rueda real */}
        <motion.div
          className={styles.wheel}
          style={{
            background: gradient,
            rotate: rotationValue,
          }}
          aria-hidden="true"
        >
          {/* Labels de segmentos */}
          {drinks.map((drink, index) => {
            const total =
              drinks.reduce((s, d) => s + (d.probability ?? 0), 0) || 1;
            const pct = ((drink.probability ?? 0) / total) * 100;
            const sliceDeg = (pct / 100) * 360;
            // Solo mostrar label si el segmento es suficientemente grande
            if (sliceDeg < 20) return null;

            const angleDeg = segmentAngles[index];
            const textColor =
              index % 2 === 0 ? "#F7F7F8" : "rgba(247,247,248,0.9)";

            return (
              <div
                key={drink._id}
                className={styles.segmentLabel}
                style={{
                  transform: `rotate(${angleDeg}deg)`,
                  color: textColor,
                }}
                aria-hidden="true"
              >
                <span className={styles.segmentText}>
                  {drink.name.length > 12
                    ? `${drink.name.slice(0, 12)}…`
                    : drink.name}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Hub central */}
        <div className={styles.hubOuter} aria-hidden="true">
          <div className={styles.hubInner}>
            <div className={styles.hubCore}>
              <svg
                className={styles.hubIcon}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2L14.5 9H22L16.5 13.5L18.5 20.5L12 16.5L5.5 20.5L7.5 13.5L2 9H9.5L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Puntero — fuera de wheelWrapper para que no rote */}
      <div className={styles.pointerWrapper} aria-hidden="true">
        <div className={styles.pointer}>
          <div className={styles.pointerArrow} />
          <div className={styles.pointerDot} />
        </div>
      </div>
    </div>
  );
});
