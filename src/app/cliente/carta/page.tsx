"use client";

// ─────────────────────────────────────────────────────────────────
// CartaPage — Carta del cliente
//
// Layout global (Navbar + Footer) provisto por ClienteShell.
// Esta página solo orquesta la experiencia de la carta.
//
// Arquitectura:
//   CartaPage (composición)
//     → useMenu         (productos, categorías, filtrado, búsqueda)
//     → usePromotions   (promociones activas, mapeo producto→promo)
//     → useClienteStore (carrito)
//       → MenuHero
//       → PromotionSection     (condicional: solo si hay promos activas)
//       → SearchBar
//       → CategoryScroller
//       → ProductGrid + ProductCard
//       → ProductDetailDrawer  (bottom-sheet/drawer)
//       → MenuEmptyState / MenuErrorState / SkeletonGrid
// ─────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { useMenu } from "@/hooks/useMenu";
import { usePromotions } from "@/hooks/usePromotions";
import { useClienteStore } from "@/stores/useClienteStore";
import type { ProductPublicDTO } from "@/lib/types/api";

import { MenuHero }            from "./components/MenuHero";
import { CategoryScroller }    from "./components/CategoryScroller";
import { SearchBar }           from "./components/SearchBar";
import { ProductCard }         from "./components/ProductCard";
import { PromotionSection }    from "./components/PromotionSection";
import { ProductDetailDrawer } from "./components/ProductDetailDrawer";
import { SkeletonGrid }        from "./components/SkeletonGrid";
import { MenuEmptyState }      from "./components/MenuEmptyState";
import { MenuErrorState }      from "./components/MenuErrorState";
import styles from "./Carta.module.css";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function groupByCategory(
  products: ProductPublicDTO[]
): { category: string; products: ProductPublicDTO[] }[] {
  const map = new Map<string, ProductPublicDTO[]>();
  for (const p of products) {
    const cat = p.category?.trim() || "Otros";
    const group = map.get(cat) ?? [];
    group.push(p);
    map.set(cat, group);
  }
  return Array.from(map.entries()).map(([category, products]) => ({
    category,
    products,
  }));
}

// ─────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────

export default function CartaPage() {
  // ── Datos ──────────────────────────────────────────────────────
  const menu = useMenu();
  const promos = usePromotions();

  // ── Carrito ────────────────────────────────────────────────────
  const cart = useClienteStore((s) => s.cart);
  const addToCart = useClienteStore((s) => s.addToCart);

  const getCartQty = (productId: string) =>
    cart.find((l) => l.productId === productId)?.quantity ?? 0;

  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = useCallback(
    (product: ProductPublicDTO) => {
      const price = product.dynamicPrice ?? product.price;
      addToCart({
        productId: product.id,
        name: product.name,
        quantity: 1,
        notes: "",
        price,
      });
    },
    [addToCart]
  );

  // ── Drawer de detalle ──────────────────────────────────────────
  const handleOpenDetail = useCallback(
    (product: ProductPublicDTO) => menu.selectProduct(product),
    [menu]
  );
  const handleCloseDetail = useCallback(
    () => menu.selectProduct(null),
    [menu]
  );
  const handleAddFromDetail = useCallback(
    (product: ProductPublicDTO) => {
      setIsAdding(true);
      handleAdd(product);
      // Pequeño delay para el feedback visual
      setTimeout(() => {
        setIsAdding(false);
        menu.selectProduct(null);
      }, 600);
    },
    [handleAdd, menu]
  );

  // ── Navegar a producto desde promo ─────────────────────────────
  const handlePromoProductClick = useCallback(
    (productId: string) => {
      const product = menu.products.find((p) => p.id === productId);
      if (product) menu.selectProduct(product);
    },
    [menu]
  );

  // ── Clear filters ──────────────────────────────────────────────
  const handleClearFilters = useCallback(() => {
    menu.setActiveCategory("all");
    menu.setSearchQuery("");
  }, [menu]);

  // ─────────────────────────────────────────────────────────────
  // Estados de carga y error
  // ─────────────────────────────────────────────────────────────

  if (menu.loading) {
    return (
      <main className={styles.page}>
        <MenuHero totalProducts={0} totalCategories={0} />
        <div className={styles.skeletonSection}>
          <SkeletonGrid />
        </div>
      </main>
    );
  }

  if (menu.error) {
    return (
      <main className={styles.page}>
        <MenuHero totalProducts={0} totalCategories={0} />
        <MenuErrorState onRetry={menu.retry} />
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Experiencia principal
  // ─────────────────────────────────────────────────────────────

  const grouped = groupByCategory(menu.filteredProducts);

  return (
    <main className={styles.page}>
      {/* ── Hero ───────────────────────────────────────────────────*/}
      <MenuHero
        totalProducts={menu.totalCount}
        totalCategories={menu.categories.length}
      />

      {/* ── Promociones activas (condicional) ──────────────────────*/}
      {!promos.loading && promos.promotions.length > 0 && (
        <section className={styles.promoSection}>
          <PromotionSection
            promotions={promos.promotions}
            onProductClick={handlePromoProductClick}
          />
        </section>
      )}

      {/* ── Controles: búsqueda + sort ──────────────────────────────*/}
      <div className={styles.controls}>
        <SearchBar
          query={menu.searchQuery}
          onQueryChange={menu.setSearchQuery}
          sortBy={menu.sortBy}
          onSortChange={menu.setSortBy}
          resultCount={menu.filteredProducts.length}
        />
      </div>

      {/* ── Categorías ─────────────────────────────────────────────*/}
      <div className={styles.categories}>
        <CategoryScroller
          categories={menu.categories}
          activeCategory={menu.activeCategory}
          onSelect={menu.setActiveCategory}
          totalCount={menu.totalCount}
        />
      </div>

      {/* ── Productos ──────────────────────────────────────────────*/}
      <div className={styles.productsSection} id="menu">
        {!menu.hasResults ? (
          <MenuEmptyState
            isFiltered={menu.isFiltered}
            searchQuery={menu.searchQuery}
            onClearFilters={handleClearFilters}
            onRetry={menu.retry}
          />
        ) : menu.activeCategory === "all" && !menu.searchQuery ? (
          /* Vista agrupada por categoría */
          <div className={styles.groupedView}>
            {grouped.map(({ category, products }) => (
              <section key={category} className={styles.categorySection}>
                <h2 className={styles.categoryHeading}>{category}</h2>
                <div className={styles.grid}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      promotion={promos.getProductPromotion(
                        product.id,
                        product.dynamicPrice ?? product.price
                      )}
                      cartQty={getCartQty(product.id)}
                      onAdd={handleAdd}
                      onOpenDetail={handleOpenDetail}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Vista plana: filtrado o búsqueda activa */
          <div className={styles.flatView}>
            {menu.searchQuery.trim() && (
              <p className={styles.resultCount} aria-live="polite">
                {menu.filteredProducts.length}{" "}
                {menu.filteredProducts.length === 1 ? "resultado" : "resultados"}
                {menu.searchQuery ? ` para "${menu.searchQuery}"` : ""}
              </p>
            )}
            <div className={styles.grid}>
              {menu.filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  promotion={promos.getProductPromotion(
                    product.id,
                    product.dynamicPrice ?? product.price
                  )}
                  cartQty={getCartQty(product.id)}
                  onAdd={handleAdd}
                  onOpenDetail={handleOpenDetail}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Drawer de detalle ──────────────────────────────────────*/}
      <ProductDetailDrawer
        product={menu.selectedProduct}
        promotion={
          menu.selectedProduct
            ? promos.getProductPromotion(
                menu.selectedProduct.id,
                menu.selectedProduct.dynamicPrice ?? menu.selectedProduct.price
              )
            : null
        }
        cartQty={menu.selectedProduct ? getCartQty(menu.selectedProduct.id) : 0}
        isAdding={isAdding}
        onAdd={handleAddFromDetail}
        onClose={handleCloseDetail}
      />
    </main>
  );
}
