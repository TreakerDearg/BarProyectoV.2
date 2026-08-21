"use client";

import { memo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductPublicDTO } from "@/lib/types/api";
import type { ProductPromotion } from "@/hooks/usePromotions";
import styles from "./ProductDetailDrawer.module.css";

// ─────────────────────────────────────────────────────────────────
// ProductDetailDrawer
// Mobile: bottom sheet. Desktop: drawer lateral derecho.
// ─────────────────────────────────────────────────────────────────

interface ProductDetailDrawerProps {
  product: ProductPublicDTO | null;
  promotion: ProductPromotion | null;
  cartQty: number;
  isAdding: boolean;
  onAdd: (product: ProductPublicDTO) => void;
  onClose: () => void;
}

function formatPrice(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

const DIETARY_LABELS: Record<string, string> = {
  "vegan": "Vegano",
  "vegetarian": "Vegetariano",
  "gluten-free": "Sin gluten",
  "dairy-free": "Sin lactosa",
  "nut-free": "Sin nueces",
  "sugar-free": "Sin azúcar",
};

export const ProductDetailDrawer = memo(function ProductDetailDrawer({
  product,
  promotion,
  cartQty,
  isAdding,
  onAdd,
  onClose,
}: ProductDetailDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap y Escape
  useEffect(() => {
    if (!product) return;
    const t = setTimeout(() => closeBtnRef.current?.focus(), 80);
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", handler);
    };
  }, [product, onClose]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  const basePrice = product ? (product.dynamicPrice ?? product.price) : 0;
  const displayPrice = promotion?.promoPrice ?? basePrice;
  const hasPromoPrice = promotion?.promoPrice != null;

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle: ${product.name}`}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Drag handle — solo mobile */}
            <div className={styles.dragHandle} aria-hidden="true" />

            {/* Botón cerrar */}
            <button
              ref={closeBtnRef}
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Cerrar detalle"
            >
              <svg viewBox="0 0 24 24" fill="none" className={styles.closeIcon} aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Imagen */}
            {product.image && (
              <div className={styles.imageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.image}
                />
                {promotion && (
                  <div className={styles.imageBadge}>{promotion.label}</div>
                )}
              </div>
            )}

            {/* Contenido scrolleable */}
            <div className={styles.body}>
              {/* Tipo + categoría */}
              <p className={styles.meta}>
                {product.type === "drink" ? "Bebida" : "Comida"}
                {product.category ? ` · ${product.category}` : ""}
                {product.drinkStyle && product.type === "drink"
                  ? ` · ${product.drinkStyle === "author" ? "Autor" : "Clásico"}`
                  : ""}
              </p>

              <h2 className={styles.name}>{product.name}</h2>

              {/* Precio */}
              <div className={styles.priceRow}>
                {hasPromoPrice && (
                  <span className={styles.strikePrice}>
                    ${formatPrice(basePrice)}
                  </span>
                )}
                <span className={`${styles.price} ${hasPromoPrice ? styles.promoPrice : ""}`}>
                  ${formatPrice(displayPrice)}
                </span>
                {promotion && (
                  <span className={styles.promoLabel}>{promotion.label}</span>
                )}
              </div>

              {/* Descripción */}
              {product.description && (
                <p className={styles.description}>{product.description}</p>
              )}

              {/* Restricciones dietarias */}
              {product.dietaryRestrictions?.length > 0 && (
                <div className={styles.dietary}>
                  {product.dietaryRestrictions.map((d) => (
                    <span key={d} className={styles.dietaryChip}>
                      {DIETARY_LABELS[d] ?? d}
                    </span>
                  ))}
                </div>
              )}

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className={styles.tags}>
                  {product.tags.map((t) => (
                    <span key={t} className={styles.tag}>#{t}</span>
                  ))}
                </div>
              )}

              {/* Disponibilidad */}
              {product.available === false && (
                <p className={styles.unavailable}>Este producto no está disponible actualmente.</p>
              )}
            </div>

            {/* CTA fijo al fondo */}
            <div className={styles.cta}>
              <div className={styles.ctaInfo}>
                {cartQty > 0 && (
                  <span className={styles.ctaQty} aria-live="polite">
                    {cartQty} en tu pedido
                  </span>
                )}
              </div>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => onAdd(product)}
                disabled={!product.available || isAdding}
                aria-busy={isAdding}
                aria-label={
                  !product.available
                    ? "Producto no disponible"
                    : cartQty > 0
                    ? `Agregar otro ${product.name}`
                    : `Agregar ${product.name} al pedido`
                }
              >
                {isAdding ? (
                  <span className={styles.addBtnSpinner} aria-hidden="true" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className={styles.addBtnIcon} aria-hidden="true">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 6h18M16 10a4 4 0 01-8 0"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {!product.available
                  ? "No disponible"
                  : isAdding
                  ? "Agregando…"
                  : "Agregar al pedido"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
