"use client";

import { useEffect, useState } from "react";
import { getPublicMenus } from "@/lib/api/bartender";
import type { PublicMenu, ProductBrief } from "@/lib/types/api";
import { ChefHat, Wine, Clapperboard } from "lucide-react";

import FilterBar from "./components/FilterBar";
import ProductCard from "./components/ProductCard";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";

import ui from "../cliente-ui.module.css";

export type Filter = "all" | "food" | "drink";

function filterProduct(product: ProductBrief, filter: Filter) {
  const t = (product.type ?? "").toLowerCase();

  if (filter === "food") return t === "food" || t === "comida";
  if (filter === "drink")
    return t === "drink" || t === "bebida" || t === "cocktail";

  return true;
}

export default function CartaPage() {
  const [menus, setMenus] = useState<PublicMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    getPublicMenus({ hideUnavailable: false })
      .then((data) => {
        if (alive) setMenus(data);
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
  }, []);

  if (loading) return <LoadingState />;
  if (error) return (
    <div className={ui.statePanelError}>
      <p>Error al cargar la carta: {error}</p>
    </div>
  );

  const hasProducts = menus.some((menu) =>
    menu.categories?.some((cat) =>
      cat.products?.some((slot) => {
        const p = slot.product;
        return p?._id && filterProduct(p, filter);
      }),
    ),
  );

  if (!hasProducts) return <EmptyState />;

  return (
    <div className={ui.cartaContainer}>
      <header className={ui.cartaHeader}>
        <div className={ui.cartaTitleGroup}>
          <Clapperboard className={ui.cartaIcon} />
          <div className={ui.cartaTitleText}>
            <h1 className={ui.cartaTitle}>Nuestra Carta</h1>
            <p className={ui.cartaSubtitle}>
              Sabores auténticos, tradición en cada bocado
            </p>
          </div>
        </div>
        <div className={ui.cartaDecorLine} />
      </header>

      <FilterBar filter={filter} setFilter={setFilter} />

      <div className={ui.cartaSections}>
        {menus.map((menu) => (
          <section key={menu._id} className={ui.cartaSection}>
            <div className={ui.cartaSectionHeader}>
              <h2 className={ui.cartaSectionTitle}>{menu.name}</h2>
              <span className={ui.cartaSectionDecor} />
            </div>

            {menu.categories?.map((cat) => {
              const visibleProducts = (cat.products ?? [])
                .map((slot) => slot.product)
                .filter((p): p is ProductBrief => !!p?._id)
                .filter((p) => filterProduct(p, filter));

              if (visibleProducts.length === 0) return null;

              return (
                <div key={cat._id} className={ui.cartaCategory}>
                  <h3 className={ui.cartaCategoryTitle}>
                    <span className={ui.cartaCategoryIcon}>
                      {cat.name.toLowerCase().includes("bebida") || cat.name.toLowerCase().includes("trago") ? (
                        <Wine className="h-4 w-4" />
                      ) : (
                        <ChefHat className="h-4 w-4" />
                      )}
                    </span>
                    {cat.name}
                  </h3>

                  <div className={ui.cartaGrid}>
                    {visibleProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}