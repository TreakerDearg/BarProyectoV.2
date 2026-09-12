"use client";

import { memo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RouletteDrinkRow } from "@/lib/types/api";
import styles from "./RouletteResultModal.module.css";

// ─────────────────────────────────────────────────────────────────
// Rareza helpers
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

const RARITY_EMOJI: Record<string, string> = {
  COMMON:    "🍸",
  RARE:      "🥂",
  EPIC:      "🌟",
  LEGENDARY: "🏆",
};

const METHOD_LABEL: Record<string, string> = {
  shake:  "Coctelera",
  stir:   "Mezclado",
  build:  "Directo",
  blend:  "Licuadora",
  muddle: "Macerado",
};

// ─────────────────────────────────────────────────────────────────
// Confetti — solo para EPIC y LEGENDARY
// ─────────────────────────────────────────────────────────────────

function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className={styles.confettiParticle}
      style={{ left: `${x}%`, background: color }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: "110vh", opacity: [1, 1, 0], rotate: 720 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: "easeIn" }}
    />
  );
}

const CONFETTI_COLORS = [
  "#D4AF37", "#F5E642", "#fff", "#B8860B",
  "#FFD700", "#E8C200", "#FFF8DC", "#C0A52A",
];

function ConfettiShower({ count = 28 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: i * 0.06,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
  return (
    <div className={styles.confettiContainer} aria-hidden="true">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} {...p} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Recipe accordion
// ─────────────────────────────────────────────────────────────────

function RecipeAccordion({ recipe }: { recipe: NonNullable<RouletteDrinkRow["recipe"]> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.recipeAccordion}>
      <button
        type="button"
        className={styles.recipeToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.recipeToggleIcon} aria-hidden="true">📋</span>
        <span className={styles.recipeToggleLabel}>
          Ver receta
          {recipe.method && (
            <span className={styles.recipeMethod}>
              · {METHOD_LABEL[recipe.method] ?? recipe.method}
            </span>
          )}
        </span>
        <motion.span
          className={styles.recipeChevron}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.recipeBody}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Ingredientes */}
            {(recipe.ingredients?.length ?? 0) > 0 && (
              <div className={styles.recipeSection}>
                <p className={styles.recipeSectionTitle}>Ingredientes</p>
                <ul className={styles.ingredientsList}>
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className={styles.ingredientItem}>
                      <span className={styles.ingredientBullet} aria-hidden="true" />
                      <span className={styles.ingredientName}>{ing.name}</span>
                      <span className={styles.ingredientQty}>
                        {ing.quantity} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preparación */}
            {(recipe.steps?.length ?? 0) > 0 && (
              <div className={styles.recipeSection}>
                <p className={styles.recipeSectionTitle}>Preparación</p>
                <ol className={styles.stepsList}>
                  {recipe.steps.map((s) => (
                    <li key={s.stepNumber} className={styles.stepItem}>
                      <span className={styles.stepNumber}>{s.stepNumber}</span>
                      <span className={styles.stepText}>{s.instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
// Componente principal
// ─────────────────────────────────────────────────────────────────

export const RouletteResultModal = memo(function RouletteResultModal({
  isOpen,
  result,
  isAdding,
  onAddToCart,
  onSpinAgain,
  onClose,
}: RouletteResultModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => closeButtonRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!result) return null;

  const rarityKey    = (result.rarity ?? "COMMON").toUpperCase();
  const rarityLabel  = RARITY_LABEL[rarityKey]  ?? result.rarity ?? "";
  const rarityClass  = RARITY_CLASS[rarityKey]  ?? styles.rarityCommon;
  const rarityEmoji  = RARITY_EMOJI[rarityKey]  ?? "🍸";
  const isHighRarity = rarityKey === "EPIC" || rarityKey === "LEGENDARY";

  const hasProduct      = Boolean(result.product);
  const productImage    = result.product?.image;
  const productPrice    = result.product?.dynamicPrice ?? result.product?.price;
  const productDesc     = result.product?.description;
  const hasRecipe       = Boolean(result.recipe?.ingredients?.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti para EPIC / LEGENDARY */}
          {isHighRarity && <ConfettiShower count={rarityKey === "LEGENDARY" ? 40 : 24} />}

          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className={`${styles.panel} ${isHighRarity ? styles.panelGlow : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Resultado: ${result.name}`}
            initial={{ opacity: 0, y: "100%", scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Drag handle mobile */}
            <div className={styles.dragHandle} aria-hidden="true" />

            {/* Botón cerrar */}
            <button
              ref={closeButtonRef}
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar resultado"
            >
              <svg viewBox="0 0 24 24" fill="none" className={styles.closeIcon}>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Header de celebración */}
            <motion.div
              className={styles.header}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className={styles.sparkleRow} aria-hidden="true">
                <span className={styles.sparkle}>{rarityEmoji}</span>
                <span className={`${styles.resultLabel} ${isHighRarity ? styles.resultLabelGold : ""}`}>
                  Tu resultado
                </span>
                <span className={styles.sparkle}>{rarityEmoji}</span>
              </div>
            </motion.div>

            {/* Drink card */}
            <motion.div
              className={styles.drinkCard}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, type: "spring", stiffness: 200 }}
            >
              {/* Imagen / placeholder */}
              <div className={`${styles.imageWrapper} ${isHighRarity ? styles.imageWrapperGlow : ""}`}>
                {productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={productImage} alt={result.name} className={styles.image} />
                ) : (
                  <div className={styles.imagePlaceholder} aria-hidden="true">
                    <span className={styles.placeholderEmoji}>{rarityEmoji}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className={styles.drinkInfo}>
                <h2 className={styles.drinkName}>{result.name}</h2>

                <div className={styles.metaRow}>
                  {rarityLabel && (
                    <span className={`${styles.rarity} ${rarityClass}`}>{rarityLabel}</span>
                  )}
                  {result.category && result.category !== "general" && (
                    <span className={styles.category}>{result.category}</span>
                  )}
                </div>

                {productDesc && (
                  <p className={styles.drinkDescription}>{productDesc}</p>
                )}

                {productPrice != null && (
                  <p className={styles.drinkPrice}>
                    ${productPrice.toLocaleString("es-AR")}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Receta vinculada */}
            {hasRecipe && result.recipe && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <RecipeAccordion recipe={result.recipe} />
              </motion.div>
            )}

            {/* Acciones */}
            <motion.div
              className={styles.actions}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
            >
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
                      <svg viewBox="0 0 24 24" fill="none" className={styles.actionIcon} aria-hidden="true">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Pedir este trago
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                className={styles.secondaryAction}
                onClick={onSpinAgain}
                disabled={isAdding}
              >
                <svg viewBox="0 0 24 24" fill="none" className={styles.actionIcon} aria-hidden="true">
                  <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
