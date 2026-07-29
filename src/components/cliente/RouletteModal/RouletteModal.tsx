"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, RotateCcw, X, PartyPopper, Sparkles } from "lucide-react";
import { memo } from "react";
import type { RouletteDrinkRow } from "@/lib/types/api";
import styles from "./RouletteModal.module.css";

interface RouletteModalProps {
  isOpen: boolean;
  result: RouletteDrinkRow | null;
  onAddToCart: () => void;
  onSpinAgain: () => void;
  onClose: () => void;
  isAdding?: boolean;
}

export const RouletteModal = memo(function RouletteModal({
  isOpen,
  result,
  onAddToCart,
  onSpinAgain,
  onClose,
  isAdding = false,
}: RouletteModalProps) {
  if (!result) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Cerrar"
            >
              <X className={styles.closeButtonIcon} />
            </button>

            {/* Celebration header */}
            <div className={styles.celebrationHeader}>
              <motion.div
                className={styles.celebrationBadge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <PartyPopper className={styles.celebrationIcon} />
              </motion.div>
              <motion.h2
                className={styles.celebrationTitle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                ¡Felicidades!
              </motion.h2>
              <motion.p
                className={styles.celebrationSubtitle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Has ganado este trago
              </motion.p>
            </div>

            {/* Drink content */}
            <div className={styles.drinkContent}>
              {/* Drink image */}
              <motion.div
                className={styles.drinkImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {result.product?.image ? (
                  <img
                    src={result.product.image}
                    alt={result.name}
                    className={styles.drinkImageImg}
                  />
                ) : (
                  <div className={styles.drinkImagePlaceholder}>
                    <Sparkles className={styles.drinkImageIcon} />
                  </div>
                )}
              </motion.div>

              {/* Drink info */}
              <motion.div
                className={styles.drinkInfo}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className={styles.drinkName}>{result.name}</h3>
                
                {result.rarity && (
                  <span className={styles.drinkRarity}>{result.rarity}</span>
                )}

                {result.product?.description && (
                  <p className={styles.drinkDescription}>
                    {result.product.description}
                  </p>
                )}

                {result.product?.price && (
                  <div className={styles.drinkPrice}>
                    ${result.product.price.toLocaleString("es-AR")}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Actions */}
            <motion.div
              className={styles.actions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <button
                type="button"
                onClick={onAddToCart}
                disabled={isAdding}
                className={styles.primaryAction}
              >
                <ShoppingCart className={styles.primaryActionIcon} />
                {isAdding ? "Agregando..." : "Pedir este trago"}
              </button>

              <button
                type="button"
                onClick={onSpinAgain}
                disabled={isAdding}
                className={styles.secondaryAction}
              >
                <RotateCcw className={styles.secondaryActionIcon} />
                Volver a girar
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
