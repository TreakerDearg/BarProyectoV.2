"use client";

import { memo, useState } from "react";
import type { ProductPublicDTO } from "@/lib/types/api";
import type { ProductPromotion } from "@/hooks/usePromotions";
import { useFavorites } from "@/hooks/useFavorites";
import { useClienteStore } from "@/stores/useClienteStore";
import styles from "./ProductCard.module.css";

// ─────────────────────────────────────────────────────────────────
// ProductCard — tarjeta de producto rediseñada
// Usa ProductPublicDTO (id, dynamicPrice real del backend)
// ─────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: ProductPublicDTO;
  promotion: ProductPromotion | null;
  cartQty: number;
  onAdd: (product: ProductPublicDTO) => void;
  onOpenDetail: (product: ProductPublicDTO) => void;
}

function formatPrice(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

export const ProductCard = memo(function ProductCard({
  product,
  promotion,
  cartQty,
  onAdd,
  onOpenDetail,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  // Favoritos — solo disponible si está autenticado
  const user = useClienteStore((s) => s.user);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favActive = user ? isFavorite(product.id) : false;

  const isAvailable = product.available !== false;
  const basePrice = product.dynamicPrice ?? product.price;

  // Precio a mostrar y precio tachado
  const displayPrice = promotion?.promoPrice ?? basePrice;
  const strikePrice = promotion?.promoPrice != null ? basePrice : null;

  const isDrink = product.type === "drink";

  return (
    <article
      className={`${styles.card} ${!isAvailable ? styles.cardUnavailable : ""}`}
      aria-label={`${product.name}${!isAvailable ? " — Agotado" : ""}`}
    >
      {/* ── Imagen ─────────────────────────────────────────────────*/}
      <button
        type="button"
        className={styles.imageBtn}
        onClick={() => isAvailable && onOpenDetail(product)}
        aria-label={`Ver detalle de ${product.name}`}
        tabIndex={isAvailable ? 0 : -1}
      >
        {product.image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className={styles.image}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className={styles.placeholderIcon}>
              {isDrink ? (
                <path d="M9 3h6l1 5H8L9 3zm0 0H6l-2 7h2m13-7h-3m3 0l2 7h-2M4 10h16v2c0 3.866-3.134 7-7 7h-2c-3.866 0-7-3.134-7-7v-2z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M3 11l19-9-9 19-2-8-8-2z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </div>
        )}

        {/* Badge de agotado */}
        {!isAvailable && (
          <div className={styles.unavailableBadge} aria-hidden="true">
            Agotado
          </div>
        )}

        {/* Badge de promoción */}
        {promotion && isAvailable && (
          <div className={styles.promoBadge} aria-label={`Promoción: ${promotion.label}`}>
            {promotion.label}
          </div>
        )}

        {/* Badge de destacado */}
        {product.featured && isAvailable && !promotion && (
          <div className={styles.featuredBadge} aria-hidden="true">
            ✦ Destacado
          </div>
        )}
      </button>

      {/* ── Contenido ──────────────────────────────────────────────*/}
      <div className={styles.content}>
        {/* Tipo */}
        <span className={styles.typeLabel} aria-hidden="true">
          {isDrink ? "Bebida" : "Comida"}
          {product.category ? ` · ${product.category}` : ""}
        </span>

        {/* Nombre */}
        <h3 className={styles.name}>{product.name}</h3>

        {/* Descripción */}
        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}

        {/* Footer: precio + botón favorito + botón agregar */}
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            {strikePrice != null && (
              <span className={styles.strikePrice} aria-label={`Precio original: $${formatPrice(strikePrice)}`}>
                ${formatPrice(strikePrice)}
              </span>
            )}
            <span
              className={`${styles.price} ${promotion?.promoPrice != null ? styles.promoPrice : ""}`}
              aria-label={`Precio: $${formatPrice(displayPrice)}`}
            >
              ${formatPrice(displayPrice)}
            </span>
          </div>

          <div className={styles.footerActions}>
            {/* Botón favorito — solo si hay sesión */}
            {user && (
              <button
                type="button"
                className={`${styles.favBtn} ${favActive ? styles.favBtnActive : ""}`}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                aria-label={favActive ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}
                aria-pressed={favActive}
              >
                <svg viewBox="0 0 24 24" fill={favActive ? "currentColor" : "none"} className={styles.addBtnIcon} aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {/* Botón agregar */}
            <button
              type="button"
              className={`${styles.addBtn} ${cartQty > 0 ? styles.addBtnActive : ""}`}
              onClick={() => onAdd(product)}
              disabled={!isAvailable}
              aria-label={
                cartQty > 0
                  ? `${cartQty} en el pedido — agregar otro`
                  : `Agregar ${product.name} al pedido`
              }
            >
              {cartQty > 0 ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className={styles.addBtnIcon} aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{cartQty}</span>
                </>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className={styles.addBtnIcon} aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});
