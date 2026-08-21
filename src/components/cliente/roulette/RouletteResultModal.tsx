"use client";

import { memo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RouletteDrinkRow } from "@/lib/types/api";
import styles from "./RouletteResultModal.module.css";

// ─────────────────────────────────────────────────────────────────
// Helpers para rareza
// ─────────────────────────────────────────────────────────────────

const RARITY_LABEL: Record<string, string> = {
  COMMON:    "Clásico",
  RARE:      "Raro",
  EPIC:      "Épico",
  LEGENDARY: "Legendario",
};

const RARITY_CLASS: Record<string, string> = {
  COMMON:    styles.rarityCommon,
  RARE:      styles.rarityRare,
  EPIC:      styles.rarityEpic,
  LEGENDARY: styles.rarityLegendary,
};

// ─────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────

interface RouletteResultModalProps {
  isOpen: boolean;
  result: RouletteDrinkRow | null;
  isAdding: boolean;
  onAddToCart: () => void;
  onSpinAgain: () => void;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────

export const RouletteResultModal = memo(function RouletteResultModal({
  isOpen,
  result,
  isAdding,
  onAddToCart,
  onSpinAgain,
  onClose,
}: RouletteResultModalProps) {
  // Trap focus cuando el modal está abierto
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Pequeño delay para que la animación empiece antes del focus
      const t = setTimeout(() => closeButtonRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!result) return null;

  const rarityKey = result.rarity?.toUpperCase() ?? "COMMON";
  const rarityLabel = RARITY_LABEL[rarityKey] ?? result.rarity ?? "";
  const rarityClass = RARITY_CLASS[rarityKey] ?? styles.rarityCommon;

  const hasProduct = Boolean(result.product);
  const productImage = result.product?.image;
  const productPrice = result.product?.dynamicPrice ?? result.product?.price;
  const productDescription = result.product?.description;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ──────────────────────────────────────────*/}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Panel ─────────────────────────────────────────────*/}
          {/* En mobile: bottom sheet. En desktop: modal centrado */}
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label={`Resultado: ${result.name}`}
            initial={{ opacity: 0, y: "100%", scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* ── Drag handle (solo mobile) ────────────────────────*/}
            <div className={styles.dragHandle} aria-hidden="true" />

            {/* ── Botón cerrar ─────────────────────────────────────*/}
            <button
              ref={closeButtonRef}
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar resultado"
            >
              <svg viewBox="0 0 24 24" fill="none" className={styles.closeIcon}>
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* ── Header de celebración ────────────────────────────*/}
            <motion.div
              className={styles.header}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className={styles.sparkleRow} aria-hidden="true">
                <span className={styles.sparkle}>✨</span>
                <span className={styles.resultLabel}>Tu resultado</span>
                <span className={styles.sparkle}>✨</span>
              </div>
            </motion.div>

            {/* ── Contenido del trago ──────────────────────────────*/}
            <motion.div
              className={styles.drinkCard}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {/* Imagen */}
              <div className={styles.imageWrapper}>
                {productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={productImage}
                    alt={result.name}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imagePlaceholder} aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className={styles.placeholderIcon}
                    >
                      <path
                        d="M9 3h6l1 5H8L9 3zm0 0H6l-2 7h2m13-7h-3m3 0l2 7h-2M4 10h16v2c0 3.866-3.134 7-7 7h-2c-3.866 0-7-3.134-7-7v-2z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info del trago */}
              <div className={styles.drinkInfo}>
                <h2 className={styles.drinkName}>{result.name}</h2>

                {rarityLabel && (
                  <span className={`${styles.rarity} ${rarityClass}`}>
                    {rarityLabel}
                  </span>
                )}

                {productDescription && (
                  <p className={styles.drinkDescription}>{productDescription}</p>
                )}

                {productPrice !== undefined && productPrice !== null && (
                  <p className={styles.drinkPrice}>
                    ${productPrice.toLocaleString("es-AR")}
                  </p>
                )}
              </div>
            </motion.div>

            {/* ── Acciones ─────────────────────────────────────────*/}
            <motion.div
              className={styles.actions}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Agregar al pedido — solo si tiene producto vinculado */}
              {hasProduct && (
                <button
                  type="button"
                  className={styles.primaryAction}
                  onClick={onAddToCart}
                  disabled={isAdding}
                  aria-busy={isAdding}
                >
                  {isAdding ? (
                    <>
                      <span className={styles.actionSpinner} aria-hidden="true" />
                      Agregando…
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className={styles.actionIcon}
                        aria-hidden="true"
                      >
                        <path
                          d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 6h18M16 10a4 4 0 01-8 0"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Pedir este trago
                    </>
                  )}
                </button>
              )}

              {/* Girar de nuevo */}
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={onSpinAgain}
                disabled={isAdding}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={styles.actionIcon}
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
                Girar de nuevo
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
