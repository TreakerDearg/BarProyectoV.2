"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicMenus } from "@/lib/api/bartender";
import type { PublicMenu, ProductBrief } from "@/lib/types/api";
import ui from "../../cliente-ui.module.css";

interface PromotionSectionProps {
  maxPromotions?: number;
}

interface Promotion {
  product: ProductBrief;
  discount?: number;
  discountPrice?: number;
  dynamicPrice?: number;
}

export default function PromotionSection({ maxPromotions = 3 }: PromotionSectionProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    getPublicMenus({ hideUnavailable: false })
      .then((menus) => {
        if (alive) {
          // Extraer productos con promociones
          const promoProducts = Array.isArray(menus) ? menus.flatMap(menu =>
            menu.categories?.flatMap(cat =>
              cat.products?.map(slot => {
                const p = slot.product;
                if (!p?._id) return null;
                
                // Detectar campos de promoción
                const hasPromotion = 
                  (p as any).promotion || 
                  (p as any).discount || 
                  p.dynamicPrice ||
                  (p as any).discountPrice;
                
                if (!hasPromotion) return null;

                return {
                  product: p,
                  discount: (p as any).discount,
                  discountPrice: (p as any).discountPrice,
                  dynamicPrice: p.dynamicPrice
                } as Promotion;
              }).filter((p): p is Promotion => !!p) || []
            ) || []
          ) : [];

          const sortedPromos = promoProducts.slice(0, maxPromotions);
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
          <h2 className={ui.promotionTitle}>Promociones Especiales</h2>
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
            const { product, discount, discountPrice, dynamicPrice } = promo;
            const originalPrice = typeof product.price === "number" ? product.price : Number(product.price ?? 0);
            const finalPrice = discountPrice || dynamicPrice || originalPrice;
            const discountPercent = discount || Math.round(((originalPrice - finalPrice) / originalPrice) * 100);

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href="/cliente/carta" className={ui.promotionCard}>
                  {/* Badge de descuento */}
                  <div className={ui.promotionBadge}>
                    -{discountPercent}%
                  </div>

                  {/* Imagen */}
                  <div className={ui.promotionImageContainer}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
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
                    <h3 className={ui.promotionProductName}>{product.name}</h3>
                    
                    {product.description && (
                      <p className={ui.promotionDescription}>
                        {product.description}
                      </p>
                    )}

                    <div className={ui.promotionFooter}>
                      <div className={ui.promotionPriceContainer}>
                        <span className={ui.promotionOriginalPrice}>
                          ${originalPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </span>
                        <span className={ui.promotionDiscountPrice}>
                          ${finalPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </span>
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
