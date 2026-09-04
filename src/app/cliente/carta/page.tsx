"use client";

import { useState, useCallback } from "react";
import { Heart } from "lucide-react";

import { useMenu }       from "@/hooks/useMenu";
import { usePromotions } from "@/hooks/usePromotions";
import { useFavorites }  from "@/hooks/useFavorites";
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
import { TableCodeGate }       from "./components/TableCodeGate";
import styles from "./Carta.module.css";

// ── Helpers ───────────────────────────────────────────────────────

function groupByCategory(
  products: ProductPublicDTO[]
): { category: string; products: ProductPublicDTO[] }[] {
  const map = new Map<string, ProductPublicDTO[]>();
  for (const p of products) {
    const cat = p.category?.trim() || "Otros";
    map.set(cat, [...(map.get(cat) ?? []), p]);
  }
  return Array.from(map.entries()).map(([category, products]) => ({
    category,
    products,
  }));
}

// ── Página ────────────────────────────────────────────────────────

export default function CartaPage() {
  const menu  = useMenu();
  const promos = usePromotions();
  const { isFavorite, favorites, loading: favsLoading } = useFavorites();

  // Carrito
  const cart       = useClienteStore((s) => s.cart);
  const addToCart  = useClienteStore((s) => s.addToCart);
  const tableCode  = useClienteStore((s) => s.tableCode);
  const user       = useClienteStore((s) => s.user);

  // Modo favoritos
  const [showFavs, setShowFavs]   = useState(false);
  // Control del gate: true = omitir gate aunque no haya tableCode
  const [gateSkipped, setGateSkipped] = useState(false);

  const isLoggedIn        = !!user;
  const hasTableSession   = !!tableCode;
  // Mostrar gate solo si el usuario está autenticado y no tiene código de mesa
  const showGate = isLoggedIn && !hasTableSession && !gateSkipped;

  const getCartQty = (productId: string) =>
    cart.find((l) => l.productId === productId)?.quantity ?? 0;

  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = useCallback(
    (product: ProductPublicDTO) => {
      addToCart({
        productId: product.id,
        name:      product.name,
        quantity:  1,
        notes:     "",
        price:     product.dynamicPrice ?? product.price,
      });
    },
    [addToCart]
  );

  const handleOpenDetail  = useCallback((p: ProductPublicDTO) => menu.selectProduct(p),  [menu]);
  const handleCloseDetail = useCallback(() => menu.selectProduct(null),                  [menu]);

  const handleAddFromDetail = useCallback(
    (product: ProductPublicDTO) => {
      setIsAdding(true);
      handleAdd(product);
      setTimeout(() => {
        setIsAdding(false);
        menu.selectProduct(null);
      }, 600);
    },
    [handleAdd, menu]
  );

  const handlePromoProductClick = useCallback(
    (productId: string) => {
      const p = menu.products.find((x) => x.id === productId);
      if (p) menu.selectProduct(p);
    },
    [menu]
  );

  const handleClearFilters = useCallback(() => {
    menu.setActiveCategory("all");
    menu.setSearchQuery("");
    setShowFavs(false);
  }, [menu]);

  // ── Productos a mostrar: normales o favoritos ─────────────────
  const displayProducts = showFavs
    ? menu.products.filter((p) => p?.id && isFavorite(p.id))
    : menu.filteredProducts;

  const grouped = groupByCategory(displayProducts);

  // ── Gate ───────────────────────────────────────────────────────
  if (showGate) {
    return (
      <TableCodeGate
        onUnlocked={() => { /* store ya se actualizó en el componente */ }}
        onSkip={() => setGateSkipped(true)}
      />
    );
  }

  // ── Loading / Error ────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────
  return (
    <main className={styles.page}>
      {/* Hero */}
      <MenuHero
        totalProducts={menu.totalCount}
        totalCategories={menu.categories.length}
      />

      {/* Promociones activas */}
      {!promos.loading && promos.promotions.length > 0 && (
        <section className={styles.promoSection}>
          <PromotionSection
            promotions={promos.promotions}
            onProductClick={handlePromoProductClick}
          />
        </section>
      )}

      {/* Controles: búsqueda + sort */}
      <div className={styles.controls}>
        <SearchBar
          query={menu.searchQuery}
          onQueryChange={menu.setSearchQuery}
          sortBy={menu.sortBy}
          onSortChange={menu.setSortBy}
          resultCount={menu.filteredProducts.length}
        />
      </div>

      {/* Categorías + filtro favoritos */}
      <div className={styles.categories}>
        <CategoryScroller
          categories={menu.categories}
          activeCategory={showFavs ? "__favs__" : menu.activeCategory}
          onSelect={(cat) => {
            setShowFavs(false);
            menu.setActiveCategory(cat);
          }}
          totalCount={menu.totalCount}
        />

        {/* Pill de favoritos — solo si hay sesión */}
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => {
              setShowFavs((v) => !v);
              if (!showFavs) {
                menu.setActiveCategory("all");
                menu.setSearchQuery("");
              }
            }}
            className={`${styles.favPill} ${showFavs ? styles.favPillActive : ""}`}
            aria-pressed={showFavs}
            aria-label="Mostrar mis favoritos"
          >
            <Heart size={13} className={showFavs ? styles.favHeartFilled : styles.favHeart} />
            <span>Mis favoritos</span>
            {favorites.length > 0 && (
              <span className={styles.favCount}>{favorites.length}</span>
            )}
          </button>
        )}
      </div>

      {/* Productos */}
      <div className={styles.productsSection} id="menu">
        {/* Empty de favoritos */}
        {showFavs && displayProducts.length === 0 && (
          <div className={styles.favsEmpty}>
            <Heart size={32} className={styles.favsEmptyIcon} aria-hidden="true" />
            <p className={styles.favsEmptyText}>Todavía no guardaste favoritos</p>
            <p className={styles.favsEmptySub}>
              Tocá el corazón en cualquier producto de la carta para guardarlo
            </p>
            <button
              type="button"
              onClick={() => setShowFavs(false)}
              className={styles.favsEmptyBtn}
            >
              Ver carta completa
            </button>
          </div>
        )}

        {!showFavs && !menu.hasResults && (
          <MenuEmptyState
            isFiltered={menu.isFiltered}
            searchQuery={menu.searchQuery}
            onClearFilters={handleClearFilters}
            onRetry={menu.retry}
          />
        )}

        {(showFavs ? displayProducts.length > 0 : menu.hasResults) && (
          <>
            {/* Vista agrupada — solo cuando no hay filtros activos ni favoritos */}
            {!showFavs && menu.activeCategory === "all" && !menu.searchQuery ? (
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
              /* Vista plana: filtrado, búsqueda o favoritos */
              <div className={styles.flatView}>
                {showFavs && (
                  <p className={styles.resultCount} aria-live="polite">
                    {displayProducts.length} favorito{displayProducts.length !== 1 ? "s" : ""}
                  </p>
                )}
                {!showFavs && menu.searchQuery.trim() && (
                  <p className={styles.resultCount} aria-live="polite">
                    {displayProducts.length}{" "}
                    {displayProducts.length === 1 ? "resultado" : "resultados"}
                    {` para "${menu.searchQuery}"`}
                  </p>
                )}
                <div className={styles.grid}>
                  {displayProducts.map((product) => (
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
          </>
        )}
      </div>

      {/* Drawer de detalle */}
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
