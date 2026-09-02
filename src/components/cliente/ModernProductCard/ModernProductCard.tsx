"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Star, GlassWater, ChefHat, ArrowRight, ShoppingCart } from "lucide-react";
import { getPublicProducts } from "@/lib/api/bartender";
import { useClienteStore } from "@/stores/useClienteStore";
import type { ProductPublicDTO } from "@/lib/types/api";
import styles from "./ModernProductCard.module.css";

const MAX_FEATURED = 8;

function ProductSkeleton() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonDesc} />
        <div className={styles.skeletonFooter} />
      </div>
    </div>
  );
}

function ProductCardItem({ product }: { product: ProductPublicDTO }) {
  const addToCart    = useClienteStore((s) => s.addToCart);
  const cart         = useClienteStore((s) => s.cart);
  const [added, setAdded] = useState(false);

  const inCartQty = cart.find((c) => c.productId === product.id)?.quantity ?? 0;
  const price = product.dynamicPrice ?? product.price ?? 0;

  const handleAdd = useCallback(() => {
    addToCart({
      productId: product.id,
      name:      product.name,
      quantity:  1,
      notes:     "",
      price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }, [addToCart, product, price]);

  const fmtPrice = (n: number) =>
    n.toLocaleString("es-AR", {
      style: "currency", currency: "ARS", maximumFractionDigits: 0,
    });

  return (
    <div className={`${styles.productCard} ${!product.available ? styles.productCardUnavailable : ""}`}>
      {/* Imagen */}
      <div className={styles.productImage}>
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <div className={styles.productImagePlaceholder}>
            {product.type === "drink"
              ? <GlassWater size={28} className={styles.placeholderIcon} />
              : <ChefHat   size={28} className={styles.placeholderIcon} />}
          </div>
        )}

        {/* Badges */}
        {product.featured && (
          <div className={styles.badgeFeatured}>
            <Star size={10} />
            Destacado
          </div>
        )}
        {!product.available && (
          <div className={styles.badgeUnavailable}>No disponible</div>
        )}
        {product.type === "drink" && (
          <div className={styles.typeTag}>
            <GlassWater size={10} />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className={styles.productContent}>
        <p className={styles.productCategory}>{product.category}</p>
        <h3 className={styles.productName}>{product.name}</h3>
        {product.description && (
          <p className={styles.productDescription}>{product.description}</p>
        )}

        <div className={styles.productFooter}>
          <span className={styles.productPrice}>{fmtPrice(price)}</span>

          <button
            type="button"
            className={`${styles.addButton} ${added ? styles.addButtonAdded : ""}`}
            onClick={handleAdd}
            disabled={!product.available}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {added ? (
              <>
                <ShoppingCart size={14} />
                <span>Agregado</span>
              </>
            ) : inCartQty > 0 ? (
              <>
                <Plus size={14} />
                <span>+1 ({inCartQty})</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModernProductCard() {
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicProducts({ available: true })
      .then((data) => {
        // Priorizar featured, luego por nombre
        const sorted = [...data].sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return a.name.localeCompare(b.name, "es");
        });
        setProducts(sorted.slice(0, MAX_FEATURED));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.productsSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionKicker}>
            <Star size={13} />
            Productos reales de la carta
          </div>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Lo más pedido</h2>
            <Link href="/cliente/carta" className={styles.seeAllLink}>
              Ver carta completa
              <ArrowRight size={15} />
            </Link>
          </div>
          <p className={styles.sectionSubtitle}>Los favoritos de nuestros clientes</p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.productsGrid}>
            {Array.from({ length: 4 }, (_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <ChefHat size={36} className={styles.emptyIcon} />
            <p>La carta se está actualizando.</p>
            <Link href="/cliente/carta" className={styles.emptyLink}>
              Ver disponibilidad en tiempo real
            </Link>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {products.map((p) => (
              <ProductCardItem key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
