"use client";

import { useEffect, useState, useMemo } from "react";
import { getPublicMenus } from "@/lib/api/bartender";
import type { PublicMenu, ProductBrief } from "@/lib/types/api";
import { ChefHat, Wine, Clapperboard, Search, X, ArrowUpDown, UtensilsCrossed, Glasses, RefreshCw } from "lucide-react";

import FilterBar from "./components/FilterBar";
import ProductCard from "./components/ProductCard";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import { useClienteStore } from "@/stores/useClienteStore";
import { Hero } from "@/components/cliente/Hero/Hero";
import MainContent from "@/components/cliente/layout/MainContent";
import Container from "@/components/cliente/layout/Container";

import ui from "../cliente-ui.module.css";

export type Filter = "all" | string;

function filterProduct(product: ProductBrief, filter: Filter, categoryName: string) {
  if (filter === "all") return true;
  
  // Filtrar por nombre de categoría exacto
  return categoryName.toLowerCase() === filter.toLowerCase();
}

// Icon mapping dinámico para categorías
function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes("bebida") || name.includes("trago") || name.includes("cocktail")) {
    return Wine;
  }
  if (name.includes("comida") || name.includes("plato") || name.includes("entrada")) {
    return UtensilsCrossed;
  }
  return Glasses;
}

export default function CartaPage() {
  const [menus, setMenus] = useState<PublicMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"network" | "server" | "timeout" | "unknown">("unknown");
  const [retryCount, setRetryCount] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "popular">("name");

  // Zustand store para carrito
  const cart = useClienteStore((state) => state.cart);
  const addToCart = useClienteStore((state) => state.addToCart);

  // Obtener cantidad de cada producto en carrito
  const getCartQty = (productId: string) => {
    const item = cart.find((c) => c.productId === productId);
    return item?.quantity ?? 0;
  };

  // Handler para agregar al carrito
  const handleAddToCart = (product: ProductBrief) => {
    addToCart({
      productId: product._id,
      name: product.name,
      quantity: 1,
      notes: "",
    });
  };

  // Detectar tipo de error
  const detectErrorType = (error: Error): "network" | "server" | "timeout" | "unknown" => {
    const message = error.message.toLowerCase();
    if (message.includes("network") || message.includes("fetch")) return "network";
    if (message.includes("timeout") || message.includes("timed out")) return "timeout";
    if (message.includes("500") || message.includes("server")) return "server";
    return "unknown";
  };

  // Retry con backoff exponencial
  const handleRetry = () => {
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10s
    
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      getPublicMenus({ hideUnavailable: false })
        .then((data) => {
          setMenus(data);
          setRetryCount(0);
        })
        .catch((e: Error) => {
          setError(e.message);
          setErrorType(detectErrorType(e));
          setRetryCount(prev => prev + 1);
        })
        .finally(() => {
          setLoading(false);
        });
    }, backoffDelay);
  };

  useEffect(() => {
    let alive = true;
    let pollingInterval: NodeJS.Timeout | null = null;

    const fetchMenus = () => {
      getPublicMenus({ hideUnavailable: false })
        .then((data) => {
          if (alive) setMenus(data);
        })
        .catch((e: Error) => {
          if (alive) {
            setError(e.message);
            setErrorType(detectErrorType(e));
          }
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    };

    setLoading(true);
    setError(null);

    // Carga inicial
    fetchMenus();

    // Polling cada 5 minutos para actualizaciones automáticas
    pollingInterval = setInterval(() => {
      if (alive && !loading) {
        fetchMenus();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      alive = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  // Filtrado combinado: tipo + búsqueda + ordenamiento
  const filteredMenus = useMemo(() => {
    if (!Array.isArray(menus)) return [];
    
    const query = searchQuery.toLowerCase().trim();
    
    return menus.map((menu) => ({
      ...menu,
      categories: menu.categories?.map((cat) => ({
        ...cat,
        products: cat.products?.filter((slot) => {
          const p = slot.product;
          if (!p?._id) return false;
          
          // Filtrar productos ocultos (si el campo existe)
          if (slot.available === false) return false;
          if (p.available === false) return false;
          
          // Filtrar por categoría
          if (!filterProduct(p, filter, cat.name)) return false;
          
          // Filtrar por búsqueda
          if (query) {
            const matchesName = p.name.toLowerCase().includes(query);
            const matchesDesc = p.description?.toLowerCase().includes(query) || false;
            return matchesName || matchesDesc;
          }
          
          return true;
        }).map((slot) => slot.product).filter((p): p is ProductBrief => !!p?._id) || []
      })).map((cat) => ({
        ...cat,
        products: [...cat.products].sort((a, b) => {
          const priceA = typeof a.price === "number" ? a.price : Number(a.price ?? 0);
          const priceB = typeof b.price === "number" ? b.price : Number(b.price ?? 0);
          
          switch (sortBy) {
            case "price":
              return priceA - priceB;
            case "popular":
              // Usar campo real de popularidad si existe, sino nombre como fallback
              const popularityA = (a as any).popularity || (a as any).salesCount || 0;
              const popularityB = (b as any).popularity || (b as any).salesCount || 0;
              if (popularityA > 0 || popularityB > 0) {
                return popularityB - popularityA;
              }
              return a.name.localeCompare(b.name);
            case "name":
            default:
              return a.name.localeCompare(b.name);
          }
        })
      })).filter((cat) => cat.products.length > 0) || []
    })).filter((menu) => menu.categories?.length > 0);
  }, [menus, filter, searchQuery, sortBy]);

  const hasProducts = filteredMenus.some((menu) =>
    menu.categories?.some((cat) => cat.products?.length > 0)
  );

  const isSearchResult = searchQuery.trim().length > 0 || filter !== "all";

  if (loading) return <LoadingState />;
  if (error) return (
    <div className={ui.statePanelError}>
      <p>Error al cargar la carta: {error}</p>
      <button
        type="button"
        onClick={handleRetry}
        className={ui.emptyStateRetry}
      >
        <RefreshCw className="h-4 w-4" />
        Intentar nuevamente
      </button>
    </div>
  );

  if (!hasProducts) return <EmptyState onRetry={handleRetry} isSearchResult={isSearchResult} />;

  return (
    <>
      {/* Hero Section - Full width */}
      <Hero 
        title="Nuestra Carta"
        subtitle="Sabores Auténticos"
        description="Descubre una experiencia gastronómica única con platos artesanales y bebidas premium preparadas con pasión."
      />

      {/* Main Content with Container */}
      <MainContent containerSize="large">
        <Container size="large">
          {/* Search Bar */}
          <div className={ui.catalogToolbar} id="menu">
            <div className={ui.catalogTopRow}>
              <div className={ui.searchWrap}>
                <Search className={ui.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={ui.searchInput}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={ui.searchClear}
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className={ui.sortSelector}>
                <ArrowUpDown className={ui.sortIcon} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "price" | "popular")}
                  className={ui.sortSelect}
                >
                  <option value="name">Nombre</option>
                  <option value="price">Precio</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>
          </div>

          <FilterBar filter={filter} setFilter={setFilter} menus={menus} />

          <div className={ui.cartaSections}>
            {filteredMenus.map((menu) => (
              <section key={menu._id} className={ui.cartaSection}>
                <div className={ui.cartaSectionHeader}>
                  <h2 className={ui.cartaSectionTitle}>{menu.name}</h2>
                  {menu.description && (
                    <p className={ui.cartaSectionDescription}>{menu.description}</p>
                  )}
                  <span className={ui.cartaSectionDecor} />
                </div>

                {menu.categories?.map((cat) => {
                  const visibleProducts = (cat.products ?? []) as ProductBrief[];

                  if (visibleProducts.length === 0) return null;

                  return (
                    <div key={cat._id} className={ui.cartaCategory}>
                      <h3 className={ui.cartaCategoryTitle}>
                        <span className={ui.cartaCategoryIcon}>
                          {(() => {
                            const CategoryIcon = getCategoryIcon(cat.name);
                            return <CategoryIcon className="h-4 w-4" />;
                          })()}
                        </span>
                        {cat.name}
                      </h3>

                      <div className={ui.cartaGrid}>
                        {visibleProducts.map((product) => (
                          <ProductCard 
                            key={product._id} 
                            product={product} 
                            cartQty={getCartQty(product._id)}
                            onAdd={handleAddToCart}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        </Container>
      </MainContent>
    </>
  );
}