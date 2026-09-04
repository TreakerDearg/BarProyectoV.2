"use client";

/**
 * OrderStatusOverlay
 * Animación full-screen que aparece cuando el estado del pedido cambia.
 * Tres fases:
 *   pending      → "Su orden fue tomada"      (dorado, icono check animado)
 *   in-progress  → "En preparación"           (naranja, icono fuego pulsante)
 *   completed    → "Lista para servir"        (verde, icono confeti)
 *
 * Se auto-descarta después de `autoDismissMs` ms.
 * El usuario también puede cerrar con el botón o haciendo tap fuera.
 */

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Flame, PartyPopper, X, UtensilsCrossed,
} from "lucide-react";
import styles from "./OrderStatusOverlay.module.css";

// ── Config por fase ───────────────────────────────────────────────

type Phase = "pending" | "in-progress" | "completed";

interface PhaseConfig {
  headline:  string;
  sub:       string;
  icon:      React.ReactNode;
  classMod:  string;   // clase modificadora del wrapper
}

const PHASE: Record<Phase, PhaseConfig> = {
  pending: {
    headline: "Su orden fue tomada",
    sub:      "El equipo recibió tu pedido y lo está procesando",
    icon:     <CheckCircle2 size={56} aria-hidden="true" />,
    classMod: styles.phasePending,
  },
  "in-progress": {
    headline: "En preparación",
    sub:      "Tus productos están siendo preparados con todo el cuidado",
    icon:     <Flame size={56} aria-hidden="true" />,
    classMod: styles.phasePrep,
  },
  completed: {
    headline: "Lista para servir",
    sub:      "Tu orden está lista — el mozo la llevará a tu mesa",
    icon:     <UtensilsCrossed size={56} aria-hidden="true" />,
    classMod: styles.phaseDone,
  },
};

const AUTO_DISMISS_MS: Record<Phase, number> = {
  pending:       3500,
  "in-progress": 3000,
  completed:     5000,
};

// ── Props ─────────────────────────────────────────────────────────

interface Props {
  /** Fase que dispara el overlay. null = no mostrar */
  phase:      Phase | null;
  orderId?:   string;
  onDismiss:  () => void;
}

// ── Componente ────────────────────────────────────────────────────

export function OrderStatusOverlay({ phase, orderId, onDismiss }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onDismiss();
  }, [onDismiss]);

  // Auto-descarte
  useEffect(() => {
    if (!phase) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS[phase]);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, dismiss]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase) dismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, dismiss]);

  const cfg = phase ? PHASE[phase] : null;

  return (
    <AnimatePresence>
      {phase && cfg && (
        /* Backdrop */
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={cfg.headline}
          aria-live="assertive"
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={dismiss}
        >
          {/* Panel central */}
          <motion.div
            className={`${styles.panel} ${cfg.classMod}`}
            initial={{ scale: 0.82, opacity: 0, y: 28 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.88,  opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cerrar */}
            <button
              type="button"
              onClick={dismiss}
              className={styles.closeBtn}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            {/* Ícono animado */}
            <motion.div
              className={styles.iconWrap}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.08 }}
            >
              {cfg.icon}
            </motion.div>

            {/* Partículas decorativas */}
            <div className={styles.particles} aria-hidden="true">
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className={styles.particle}
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale:   [0, 1, 0.5],
                    y:       [0, -60 - i * 10],
                    x:       [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 12)],
                  }}
                  transition={{
                    duration: 1.1,
                    delay: 0.15 + i * 0.07,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            {/* Texto */}
            <motion.div
              className={styles.textBlock}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.3 }}
            >
              <h2 className={styles.headline}>{cfg.headline}</h2>
              <p  className={styles.sub}>{cfg.sub}</p>
              {orderId && (
                <p className={styles.orderId}>
                  Pedido #{orderId.slice(-6).toUpperCase()}
                </p>
              )}
            </motion.div>

            {/* Barra de auto-descarte */}
            <motion.div
              className={styles.timerBar}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{
                duration: AUTO_DISMISS_MS[phase] / 1000,
                ease: "linear",
              }}
              style={{ originX: 0 }}
              aria-hidden="true"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
