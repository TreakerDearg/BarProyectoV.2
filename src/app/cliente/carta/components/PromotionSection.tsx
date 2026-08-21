"use client";

import { memo } from "react";
import type { PromotionPublicDTO } from "@/lib/types/api";
import { PromotionCard } from "./PromotionCard";
import styles from "./PromotionSection.module.css";

// ─────────────────────────────────────────────────────────────────
// PromotionSection
// Solo se renderiza si hay promociones activas reales.
// Nunca muestra una sección vacía.
// ─────────────────────────────────────────────────────────────────

interface PromotionSectionProps {
  promotions: PromotionPublicDTO[];
  onProductClick?: (productId: string) => void;
}

export const PromotionSection = memo(function PromotionSection({
  promotions,
  onProductClick,
}: PromotionSectionProps) {
  // No renderizar si no hay promociones activas
  const active = promotions.filter((p) => p.active);
  if (active.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Promociones activas">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.flame} aria-hidden="true">🔥</span>
          <div>
            <h2 className={styles.heading}>Promociones</h2>
            <p className={styles.subheading}>
              {active.length === 1
                ? "1 oferta disponible esta noche"
                : `${active.length} ofertas disponibles esta noche`}
            </p>
          </div>
        </div>
      </div>

      {/* Cards en scroll horizontal */}
      <div className={styles.scroller} role="list">
        {active.map((promo) => (
          <div key={promo.id} role="listitem">
            <PromotionCard
              promotion={promo}
              onProductClick={onProductClick}
            />
          </div>
        ))}
      </div>
    </section>
  );
});
