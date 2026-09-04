"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Tag, ChefHat } from "lucide-react";
import { getPublicPromotions } from "@/lib/api/bartender";
import { useClienteStore } from "@/stores/useClienteStore";
import type { PromotionPublicDTO } from "@/lib/types/api";
import styles from "./PromotionCard.module.css";

function fmtPrice(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  });
}

function calcDiscountedPrice(basePrice: number, type: string, value: number): number | null {
  if (type === "PERCENT") return Math.max(0, basePrice * (1 - value / 100));
  if (type === "FLAT")    return Math.max(0, basePrice - value);
  return null;
}

export function PromotionCard() {
  const [promotions, setPromotions]  = useState<PromotionPublicDTO[]>([]);
  const [loading, setLoading]        = useState(true);
  const addToCart = useClienteStore((s) => s.addToCart);

  useEffect(() => {
    getPublicPromotions()
      .then((data) => setPromotions(data.filter((p) => p.active).slice(0, 3)))
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false));
  }, []);

  // Sin promociones activas → sección oculta
  if (!loading && promotions.length === 0) return null;

  return (
    <section className={styles.promotionSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            Ofertas activas
          </div>
          <h2 className={styles.title}>Promociones de hoy</h2>
          <p className={styles.subtitle}>Solo por tiempo limitado</p>
        </div>

        {/* Cards */}
        {loading ? (
          <div className={styles.promotionsGrid}>
            {[0,1].map((i) => (
              <div key={i} className={styles.skeletonCard} aria-hidden="true">
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.skeletonDesc} />
                  <div className={styles.skeletonPrice} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.promotionsGrid}>
            {promotions.map((promo) => {
              // Tomar el primer producto aplicable
              const product = promo.applicableProducts?.[0];
              if (!product?.id) return null; // guardia: producto sin datos válidos
              const basePrice = product.price ?? 0;
              const discountedPrice = calcDiscountedPrice(basePrice, promo.type, promo.value);

              // Etiqueta del descuento
              const discountLabel =
                promo.type === "PERCENT" ? `-${promo.value}%`  :
                promo.type === "FLAT"    ? `-${fmtPrice(promo.value)}` :
                promo.type === "2X1"     ? "2×1"               : "Promo";

              return (
                <div key={promo.id} className={styles.promoCard}>
                  {/* Imagen */}
                  <div className={styles.promoImageWrap}>
                    {product?.image ? (
                      <img
                        src={product.image}
                        alt={product.name ?? promo.name}
                        className={styles.promoImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.promoImagePlaceholder}>
                        <ChefHat size={32} className={styles.promoPlaceholderIcon} />
                      </div>
                    )}
                    <div className={styles.promoOverlay} />
                    <div className={styles.discountBadge}>{discountLabel}</div>
                  </div>

                  {/* Contenido */}
                  <div className={styles.promoContent}>
                    <div className={styles.promoMeta}>
                      <Tag size={12} />
                      {promo.name}
                    </div>

                    <h3 className={styles.promoProductName}>
                      {product?.name ?? "Producto seleccionado"}
                    </h3>

                    {promo.description && (
                      <p className={styles.promoDesc}>{promo.description}</p>
                    )}

                    {/* Precios */}
                    {basePrice > 0 && (
                      <div className={styles.priceRow}>
                        {discountedPrice !== null ? (
                          <>
                            <span className={styles.currentPrice}>
                              {fmtPrice(discountedPrice)}
                            </span>
                            <span className={styles.originalPrice}>
                              {fmtPrice(basePrice)}
                            </span>
                          </>
                        ) : (
                          <span className={styles.currentPrice}>
                            {fmtPrice(basePrice)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className={styles.promoActions}>
                      {product && (
                        <button
                          type="button"
                          className={styles.addBtn}
                          onClick={() => {
                            addToCart({
                              productId: product.id,
                              name:      product.name ?? promo.name,
                              quantity:  1,
                              notes:     "",
                              price:     discountedPrice ?? basePrice,
                            });
                          }}
                          disabled={!product.available}
                        >
                          Agregar al carrito
                        </button>
                      )}
                      <Link href="/cliente/carta" className={styles.cartaLink}>
                        Ver carta
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
