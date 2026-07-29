"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicMenus } from "@/lib/api/bartender";
import type { PublicMenu, ProductBrief } from "@/lib/types/api";
import { useClienteStore } from "@/stores/useClienteStore";
import ui from "../../cliente-ui.module.css";

interface FeaturedProductsProps {
  maxProducts?: number;
}

export default function FeaturedProducts({ maxProducts = 8 }: FeaturedProductsProps) {
  const [products, setProducts] = useState<ProductBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useClienteStore((state) => state.addToCart);
  const cart = useClienteStore((state) => state.cart);

  const getCartQty = (productId: string) => {
    const item = cart.find((c) => c.productId === productId);
    return item?.quantity ?? 0;
  };

  useEffect(() => {
    let alive = true;

    getPublicMenus({ hideUnavailable: false })
      .then((menus) => {
        if (alive) {
          // Extraer todos los productos de todas las categorías
          const allProducts = Array.isArray(menus) ? menus.flatMap(menu =>
            menu.categories?.flatMap(cat =>
              cat.products?.map(slot => slot.product).filter((p): p is ProductBrief => !!p?._id) || []
            ) || []
          ) : [];

          // Ordenar por disponibilidad y nombre
          const sortedProducts = allProducts
            .filter(p => p.available !== false)
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, maxProducts);

          setProducts(sortedProducts);
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
  }, [maxProducts]);

  const handleAddToCart = (product: ProductBrief) => {
    addToCart({
      productId: product._id,
      name: product.name,
      quantity: 1,
      notes: "",
    });
  };

  if (loading) {
    return (
      <section className={ui.featuredProductsSection}>
        <div className={ui.featuredProductsContainer}>
          <h2 className={ui.featuredProductsTitle}>Productos Destacados</h2>
          <div className={ui.featuredProductsGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={ui.featuredProductSkeleton} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section className={ui.featuredProductsSection}>
      <div className={ui.featuredProductsContainer}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className={ui.featuredProductsHeader}
        >
          <h2 className={ui.featuredProductsTitle}>Nuestros Favoritos</h2>
          <p className={ui.featuredProductsSubtitle}>
            Los platos y bebidas más solicitados por nuestros clientes
          </p>
          <Link href="/cliente/carta" className={ui.featuredProductsViewAll}>
            Ver toda la carta
            <ArrowRight className={ui.featuredProductsViewAllIcon} />
          </Link>
        </motion.div>

        {/* Bento Grid */}
        <div className={ui.featuredProductsGrid}>
          {products.map((product, index) => {
            const cartQty = getCartQty(product._id);
            const price = typeof product.price === "number" ? product.price : Number(product.price ?? 0);
            const isFeatured = index === 0; // Primer producto es destacado (más grande)

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={ui.featuredProductCard}
                data-featured={isFeatured}
              >
                <Link href="/cliente/carta" className={ui.featuredProductLink}>
                  {/* Product Image */}
                  <div className={ui.featuredProductImageContainer}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={ui.featuredProductImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={ui.featuredProductImagePlaceholder}>
                        <Star className={ui.featuredProductPlaceholderIcon} />
                      </div>
                    )}
                    
                    {/* Availability Badge */}
                    {product.available === false && (
                      <div className={ui.featuredProductBadge}>
                        Agotado
                      </div>
                    )}
                  </div>

                  {/* Product Content */}
                  <div className={ui.featuredProductContent}>
                    <h3 className={ui.featuredProductName}>{product.name}</h3>
                    
                    {product.description && (
                      <p className={ui.featuredProductDescription}>
                        {product.description}
                      </p>
                    )}

                    <div className={ui.featuredProductFooter}>
                      <span className={ui.featuredProductPrice}>
                        ${price.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        disabled={product.available === false}
                        className={ui.featuredProductAddBtn}
                      >
                        {cartQty > 0 ? (
                          <span className={ui.featuredProductAddBtnCount}>{cartQty}</span>
                        ) : (
                          <Plus className={ui.featuredProductAddBtnIcon} />
                        )}
                      </button>
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
