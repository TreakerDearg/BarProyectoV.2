"use client";

import { motion, useSpring, useTransform, animate } from "framer-motion";
import { Sparkles } from "lucide-react";
import { memo, useRef, useEffect, useState } from "react";
import type { RouletteDrinkRow } from "@/lib/types/api";
import styles from "./RouletteWheel.module.css";

interface RouletteWheelProps {
  drinks: RouletteDrinkRow[];
  spinning: boolean;
  onSpinComplete?: () => void;
}

export type RouletteState = "idle" | "spinning" | "winning" | "result" | "error" | "empty";

function wheelGradient(drinks: RouletteDrinkRow[]) {
  const total = drinks.reduce((s, d) => s + (d.probability ?? 0), 0) || 1;
  let deg = 0;
  const parts: string[] = [];
  
  for (const d of drinks) {
    const pct = ((d.probability ?? 0) / total) * 100;
    const slice = (pct / 100) * 360;
    const color = d.color?.trim() || "#4a4f5c";
    const a = deg;
    const b = deg + slice;
    parts.push(`${color} ${a}deg ${b}deg`);
    deg = b;
  }
  
  if (!parts.length) return "conic-gradient(#333 0deg 360deg)";
  return `conic-gradient(from -90deg, ${parts.join(", ")})`;
}

export const RouletteWheel = memo(function RouletteWheel({ 
  drinks, 
  spinning, 
  onSpinComplete 
}: RouletteWheelProps) {
  const rotation = useSpring(0, { stiffness: 100, damping: 30 });
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const gradient = wheelGradient(drinks);

  useEffect(() => {
    if (spinning && !isSpinning && !prefersReducedMotion) {
      setIsSpinning(true);
      
      // Animación realista: aceleración → velocidad máxima → desaceleración → rebote
      const totalRotation = 1440 + Math.random() * 720; // 4-6 vueltas + aleatorio
      
      animate(0, totalRotation, {
        duration: 5,
        ease: [0.25, 0.1, 0.25, 1], // Custom easing para efecto realista
        onUpdate: (latest) => {
          rotation.set(latest);
        },
        onComplete: () => {
          setIsSpinning(false);
          onSpinComplete?.();
        }
      });
    } else if (spinning && prefersReducedMotion) {
      // Animación simplificada para prefers-reduced-motion
      setIsSpinning(true);
      const totalRotation = 720 + Math.random() * 360;
      
      animate(0, totalRotation, {
        duration: 2,
        ease: "linear",
        onUpdate: (latest) => {
          rotation.set(latest);
        },
        onComplete: () => {
          setIsSpinning(false);
          onSpinComplete?.();
        }
      });
    }
  }, [spinning, isSpinning, rotation, onSpinComplete, prefersReducedMotion]);

  return (
    <div className={styles.wheelContainer} role="img" aria-label="Ruleta de tragos">
      {/* Outer glow */}
      <div className={styles.wheelGlow} aria-hidden="true" />
      
      {/* Wheel wrapper */}
      <div className={styles.wheelWrapper}>
        {/* Main wheel */}
        <motion.div
          ref={wheelRef}
          className={styles.wheel}
          style={{ 
            background: gradient,
            rotate: rotation
          }}
          aria-hidden="true"
        >
          {/* Segments overlay */}
          {drinks.map((drink, index) => {
            const total = drinks.reduce((s, d) => s + (d.probability ?? 0), 0) || 1;
            const pct = ((drink.probability ?? 0) / total) * 100;
            const slice = (pct / 100) * 360;
            
            return (
              <div
                key={drink._id}
                className={styles.wheelSegment}
                style={{
                  transform: `rotate(${index * (360 / drinks.length)}deg)`,
                }}
                aria-hidden="true"
              >
                <span className={styles.segmentName}>{drink.name}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Center hub */}
        <div className={styles.wheelCenter} aria-hidden="true">
          <div className={styles.wheelCenterInner}>
            <Sparkles className={styles.wheelCenterIcon} aria-hidden="true" />
          </div>
        </div>

        {/* Pointer */}
        <div className={styles.wheelPointer} aria-hidden="true" />
      </div>

      {/* Decorative rings */}
      <div className={styles.wheelRing} aria-hidden="true" />
      <div className={styles.wheelRingSecondary} aria-hidden="true" />
    </div>
  );
});
