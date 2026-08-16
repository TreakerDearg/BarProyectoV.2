"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicPromotions } from "@/lib/api/bartender";
import type { PromotionPublicDTO } from "@/lib/types/api";
import ui from "../../cliente-ui.module.css";

interface PromotionSectionProps {
  maxPromotions?: number;
}

export default function PromotionSection({ maxPromotions = 3 }: PromotionSectionProps) {
  const [promotions, setPromotions] = useState<PromotionPublicDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    getPublicPromotions()
      .then((data) => {
        if (alive) {
          const promoArray = Array.isArray(data) ? data : [];
          const sortedPromos = promoArray.slice(0, maxPromotions);
          setPromotions(sortedPromos);
        }
      })
      .catch((e: Error) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [maxPromotions]);

  if (loading) {
    return (
      <section className={ui.promotionSection}>
        <div className={ui.promotionContainer}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={ui.promotionHeader}
          >
            <h2 className={ui.promotionTitle}>
              <Tag className={ui.promotionTitleIcon} />
              Promociones Especiales
            </h2>
            <p className={ui.promotionSubtitle}>
              Aprovecha nuestras ofertas exclusivas por tiempo limitado
            </p>
          </motion.div>
          <div className={ui.promotionGrid}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={ui.promotionSkeleton} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || promotions.length === 0) {
    return null;
  }

  return (
    <section className={ui.promotionSection}>
      <div className={ui.promotionContainer}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className={ui.promotionHeader}
        >
          <h2 className={ui.promotionTitle}>
            <Tag className={ui.promotionTitleIcon} />
            Promociones Especiales
          </h2>
          <p className={ui.promotionSubtitle}>
            Aprovecha nuestras ofertas exclusivas por tiempo limitado
          </p>
        </motion.div>

        <div className={ui.promotionGrid}>
          {promotions.map((promo, index) => {
            // Calculate discount percentage based on promotion type
            let discountPercent = 0;
            if (promo.type === "PERCENT") {
              discountPercent = promo.value;
            } else if (promo.type === "2X1") {
              discountPercent = 50;
            } else if (promo.type === "FLAT" && promo.applicableProducts.length > 0) {
              // For flat discounts, calculate average discount percentage
              const avgPrice = promo.applicableProducts.reduce((sum, p) => sum + p.price, 0) / promo.applicableProducts.length;
              discountPercent = Math.round((promo.value / avgPrice) * 100);
            }

            // Get first applicable product for display
            const displayProduct = promo.applicableProducts[0];

            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href="/cliente/carta" className={ui.promotionCard}>
                  {/* Badge de descuento */}
                  {discountPercent > 0 && (
                    <div className={ui.promotionBadge}>
                      -{discountPercent}%
                    </div>
                  )}

                  {/* Imagen */}
                  <div className={ui.promotionImageContainer}>
                    {displayProduct?.image ? (
                      <img
                        src={displayProduct.image}
                        alt={displayProduct.name}
                        className={ui.promotionImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={ui.promotionImagePlaceholder}>
                        <Tag className={ui.promotionPlaceholderIcon} />
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className={ui.promotionContent}>
                    <h3 className={ui.promotionProductName}>{promo.name}</h3>
                    
                    {promo.description && (
                      <p className={ui.promotionDescription}>
                        {promo.description}
                      </p>
                    )}

                    <div className={ui.promotionFooter}>
                      <div className={ui.promotionPriceContainer}>
                        {promo.type === "2X1" ? (
                          <span className={ui.promotionDiscountPrice}>
                            2x1
                          </span>
                        ) : (
                          <>
                            {displayProduct && (
                              <>
                                <span className={ui.promotionOriginalPrice}>
                                  ${displayProduct.price.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                                </span>
                                <span className={ui.promotionDiscountPrice}>
                                  {promo.type === "PERCENT" 
                                    ? `$${Math.round(displayProduct.price * (1 - promo.value / 100)).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                                    : promo.type === "FLAT"
                                    ? `$${Math.max(0, displayProduct.price - promo.value).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                                    : "Ver oferta"
                                  }
                                </span>
                              </>
                            )}
                          </>
                        )}
                      </div>

                      <div className={ui.promotionArrow}>
                        <ArrowRight className={ui.promotionArrowIcon} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
