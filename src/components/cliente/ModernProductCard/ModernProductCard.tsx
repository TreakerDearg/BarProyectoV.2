"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, Star, GlassWater, ChefHat, ArrowRight, ShoppingCart, Check, Sparkles } from "lucide-react";
import { getHomeFeatured, getPublicProducts } from "@/lib/api/bartender";
import { useClienteStore } from "@/stores/useClienteStore";
import type { ProductPublicDTO, HomeFeaturedDTO } from "@/lib/types/api";
import styles from "./ModernProductCard.module.css";

// Fallbacks de alta definición para que ninguna card se vea rota o vacía
const PRODUCT_FALLBACK_IMAGES = {
  drink: [
    "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  ],
};

function getProductImage(product: ProductPublicDTO, index: number): string {
  if (product.image && (product.image.startsWith("http") || product.image.startsWith("/"))) {
    return product.image;
  }
  const pool = product.type === "drink" ? PRODUCT_FALLBACK_IMAGES.drink : PRODUCT_FALLBACK_IMAGES.food;
  return pool[index % pool.length];
}

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

function ProductCardItem({ product, index }: { product: ProductPublicDTO; index: number }) {
  const addToCart = useClienteStore((s) => s.addToCart);
  const cart      = useClienteStore((s) => s.cart);
  const [added, setAdded] = useState(false);

  const inCartQty = cart.find((c) => c.productId === product.id)?.quantity ?? 0;
  const price = product.dynamicPrice ?? product.price ?? 0;
  const imageUrl = getProductImage(product, index);

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
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });

  return (
    <div className={`${styles.productCard} ${!product.available ? styles.productCardUnavailable : ""}`}>
      {/* Imagen & Badges */}
      <div className={styles.productImageWrap}>
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className={styles.productImage}
        />
        <div className={styles.productImageOverlay} />

        {/* Tipo de producto pill */}
        <div className={styles.typeTag}>
          {product.type === "drink" ? (
            <>
              <GlassWater size={11} className="text-[#F0B429]" />
              <span>Barra de Autor</span>
            </>
          ) : (
            <>
              <ChefHat size={11} className="text-[#F0B429]" />
              <span>Cocina & Brasa</span>
            </>
          )}
        </div>

        {product.featured && (
          <div className={styles.badgeFeatured}>
            <Star size={10} />
            <span>Destacado</span>
          </div>
        )}

        {!product.available && (
          <div className={styles.badgeUnavailable}>Agotado hoy</div>
        )}
      </div>

      {/* Contenido Editorial */}
      <div className={styles.productContent}>
        <div className={styles.categoryLine}>
          <span className={styles.productCategory}>{product.category}</span>
        </div>

        <h3 className={styles.productName}>{product.name}</h3>

        {product.description && (
          <p className={styles.productDescription}>{product.description}</p>
        )}

        <div className={styles.productFooter}>
          <div className={styles.priceContainer}>
            <span className={styles.productPrice}>{fmtPrice(price)}</span>
          </div>

          <button
            type="button"
            className={`${styles.addButton} ${added ? styles.addButtonAdded : ""}`}
            onClick={handleAdd}
            disabled={!product.available}
            aria-label={`Agregar ${product.name} al pedido`}
          >
            {added ? (
              <>
                <Check size={14} />
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
                <span>Pedir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModernProductCard() {
  const [featuredData, setFeaturedData] = useState<HomeFeaturedDTO>({
    headline: "Nuestra Selección de Autor",
    subtitle: "Las creaciones y platos más aclamados de nuestra barra y cocina",
    badge: "Recomendados de la Casa",
    maxItems: 6,
    productIds: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "drink" | "food">("all");

  useEffect(() => {
    getHomeFeatured()
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setFeaturedData(data);
        } else {
          // Fallback a productos públicos si aún no hay configurados
          getPublicProducts({ available: true }).then((prods) => {
            const sorted = [...prods].slice(0, data?.maxItems || 6);
            setFeaturedData({
              headline: data?.headline || "Nuestra Selección de Autor",
              subtitle: data?.subtitle || "Las creaciones y platos más aclamados de nuestra barra y cocina",
              badge: data?.badge || "Recomendados de la Casa",
              maxItems: data?.maxItems || 6,
              productIds: sorted.map((p) => p.id),
              products: sorted,
            });
          });
        }
      })
      .catch(() => {
        // Fallback silencioso a productos públicos
        getPublicProducts({ available: true })
          .then((prods) => {
            setFeaturedData((prev) => ({
              ...prev,
              products: prods.slice(0, 6),
            }));
          })
          .catch(() => { /* silencioso */ });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    if (filterType === "all") return featuredData.products;
    return featuredData.products.filter((p) => p.type === filterType);
  }, [featuredData.products, filterType]);

  return (
    <section className={styles.productsSection}>
      <div className={styles.container}>
        {/* Header configurable desde Desktop Settings */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionKicker}>
            <Sparkles size={12} className="text-[#F0B429]" />
            <span>{featuredData.badge || "Recomendados de la Casa"}</span>
          </div>

          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>
              {featuredData.headline || "Nuestra Selección de Autor"}
            </h2>
            <Link href="/cliente/carta" className={styles.seeAllLink}>
              <span>Ver carta completa</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <p className={styles.sectionSubtitle}>
            {featuredData.subtitle || "Las creaciones y platos más aclamados de nuestra barra y cocina"}
          </p>

          {/* Filtros por Tipo de Producto */}
          <div className={styles.filterPills}>
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`${styles.filterPill} ${filterType === "all" ? styles.filterPillActive : ""}`}
            >
              Todos los destacados ({featuredData.products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("drink")}
              className={`${styles.filterPill} ${filterType === "drink" ? styles.filterPillActive : ""}`}
            >
              <GlassWater size={12} />
              Barra & Cócteles ({featuredData.products.filter((p) => p.type === "drink").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("food")}
              className={`${styles.filterPill} ${filterType === "food" ? styles.filterPillActive : ""}`}
            >
              <ChefHat size={12} />
              Cocina & Fuegos ({featuredData.products.filter((p) => p.type === "food").length})
            </button>
          </div>
        </div>

        {/* Grilla de Productos Destacados */}
        {loading ? (
          <div className={styles.productsGrid}>
            {Array.from({ length: 4 }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <ChefHat size={36} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No hay productos en esta categoría por el momento.</p>
            <Link href="/cliente/carta" className={styles.emptyLink}>
              Explorar todo el menú
            </Link>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {filteredProducts.map((p, idx) => (
              <ProductCardItem key={p.id} product={p} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
