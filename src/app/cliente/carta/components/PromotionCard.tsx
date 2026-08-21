"use client";

import { memo } from "react";
import type { PromotionPublicDTO } from "@/lib/types/api";
import styles from "./PromotionCard.module.css";

// ─────────────────────────────────────────────────────────────────
// PromotionCard — tarjeta de promoción real (no hardcodeada)
// Muestra solo datos reales que existen en la PromotionPublicDTO
// ─────────────────────────────────────────────────────────────────

interface PromotionCardProps {
  promotion: PromotionPublicDTO;
  onProductClick?: (productId: string) => void;
}

function buildDiscountLabel(type: string, value: number): string {
  switch (type) {
    case "PERCENT": return `-${value}%`;
    case "FLAT":    return `-$${value.toLocaleString("es-AR")}`;
    case "2X1":     return "2×1";
    case "CUSTOM":  return "Oferta especial";
    default:        return "Promo";
  }
}

function calcPromoPrice(price: number, type: string, value: number): number | null {
  if (type === "PERCENT") return Math.max(0, Math.round(price * (1 - value / 100) * 100) / 100);
  if (type === "FLAT")    return Math.max(0, Math.round((price - value) * 100) / 100);
  return null;
}

export const PromotionCard = memo(function PromotionCard({
  promotion,
  onProductClick,
}: PromotionCardProps) {
  const discountLabel = buildDiscountLabel(promotion.type, promotion.value);
  // Si hay productos aplicables, tomar el primero para mostrar imagen
  const firstProduct = promotion.applicableProducts?.[0] ?? null;

  return (
    <article className={styles.card}>
      {/* Badge descuento */}
      <div className={styles.discountBadge} aria-label={`Descuento: ${discountLabel}`}>
        {discountLabel}
      </div>

      {/* Imagen del primer producto aplicable */}
      <div className={styles.imageWrapper}>
        {firstProduct?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstProduct.image}
            alt={firstProduct.name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className={styles.placeholderIcon}>
              <path d="M12 2l2.5 7H22l-6.5 4.5 2.5 7L12 17l-6 4.5 2.5-7L2 9h7.5L12 2z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className={styles.content}>
        <h3 className={styles.name}>{promotion.name}</h3>

        {promotion.description && (
          <p className={styles.description}>{promotion.description}</p>
        )}

        {/* Productos aplicables */}
        {promotion.applicableProducts.length > 0 && (
          <div className={styles.products}>
            {promotion.applicableProducts.slice(0, 3).map((ap) => {
              const promoPrice = calcPromoPrice(ap.price, promotion.type, promotion.value);
              return (
                <button
                  key={ap.id}
                  type="button"
                  className={styles.productChip}
                  onClick={() => onProductClick?.(ap.id)}
                  aria-label={`Ver ${ap.name}`}
                >
                  <span className={styles.productChipName}>{ap.name}</span>
                  <span className={styles.productChipPrices}>
                    {promoPrice != null ? (
                      <>
                        <span className={styles.originalPrice}>
                          ${ap.price.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </span>
                        <span className={styles.finalPrice}>
                          ${promoPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </span>
                      </>
                    ) : (
                      <span className={styles.finalPrice}>
                        ${ap.price.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
            {promotion.applicableProducts.length > 3 && (
              <span className={styles.moreProducts}>
                +{promotion.applicableProducts.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Categorías aplicables (si no hay productos específicos) */}
        {promotion.applicableProducts.length === 0 &&
          promotion.applicableCategories.length > 0 && (
            <div className={styles.categories}>
              <span className={styles.categoriesLabel}>Aplica en: </span>
              {promotion.applicableCategories.join(", ")}
            </div>
          )}
      </div>
    </article>
  );
});
