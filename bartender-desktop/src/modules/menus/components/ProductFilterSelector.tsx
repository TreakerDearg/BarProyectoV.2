"use client";

import { useState, useMemo } from "react";
import { Filter, Search, X, Martini, Utensils, Sparkles } from "lucide-react";
import type { Product } from "../../../types/product";

interface Props {
  products: Product[];
  onAddProduct: (product: Product) => void;
  addedProductIds: Set<string>;
}

export default function ProductFilterSelector({ products, onAddProduct, addedProductIds }: Props) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "drink" | "food">("all");
  const [filterDrinkStyle, setFilterDrinkStyle] = useState<"all" | "author" | "classic">("all");

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => !addedProductIds.has(p._id || ""));

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((p) => p.type === filterType);
    }

    if (filterDrinkStyle !== "all") {
      filtered = filtered.filter((p) => p.drinkStyle === filterDrinkStyle);
    }

    return filtered;
  }, [products, addedProductIds, search, filterType, filterDrinkStyle]);

  const drinkProductsCount = products.filter((p) => p.type === "drink").length;
  const foodProductsCount = products.filter((p) => p.type === "food").length;

  return (
    <div className="nebula-panel p-6 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gold/10 rounded-xl">
          <Filter className="text-gold" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Selector de Productos</h3>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-3 border-white/10 rounded-lg pl-10 pr-10 py-3 text-ivory focus:ring-2 focus:ring-gold/40 focus:border-transparent transition-all outline-none"
          placeholder="Buscar productos..."
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ivory"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType("all")}
          className={`flex-1 p-2 rounded-lg border transition-all text-xs font-semibold ${
            filterType === "all"
              ? "bg-gold/10 border-gold/30 text-gold"
              : "bg-white/5 border-white/10 text-muted hover:border-white/20"
          }`}
        >
          Todos ({products.length})
        </button>
        <button
          onClick={() => setFilterType("drink")}
          className={`flex-1 p-2 rounded-lg border transition-all text-xs font-semibold ${
            filterType === "drink"
              ? "bg-gold/10 border-gold/30 text-gold"
              : "bg-white/5 border-white/10 text-muted hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Martini size={12} />
            Bebidas ({drinkProductsCount})
          </div>
        </button>
        <button
          onClick={() => setFilterType("food")}
          className={`flex-1 p-2 rounded-lg border transition-all text-xs font-semibold ${
            filterType === "food"
              ? "bg-gold/10 border-gold/30 text-gold"
              : "bg-white/5 border-white/10 text-muted hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Utensils size={12} />
            Comida ({foodProductsCount})
          </div>
        </button>
      </div>

      {/* Drink Style Filter (only visible when filtering drinks) */}
      {filterType === "drink" && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilterDrinkStyle("all")}
            className={`flex-1 p-2 rounded-lg border transition-all text-xs font-semibold ${
              filterDrinkStyle === "all"
                ? "bg-violet/10 border-violet/30 text-violet-300"
                : "bg-white/5 border-white/10 text-muted hover:border-white/20"
            }`}
          >
            Todos los estilos
          </button>
          <button
            onClick={() => setFilterDrinkStyle("author")}
            className={`flex-1 p-2 rounded-lg border transition-all text-xs font-semibold ${
              filterDrinkStyle === "author"
                ? "bg-violet/10 border-violet/30 text-violet-300"
                : "bg-white/5 border-white/10 text-muted hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Sparkles size={12} />
              Autor
            </div>
          </button>
          <button
            onClick={() => setFilterDrinkStyle("classic")}
            className={`flex-1 p-2 rounded-lg border transition-all text-xs font-semibold ${
              filterDrinkStyle === "classic"
                ? "bg-emerald/10 border-emerald/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-muted hover:border-white/20"
            }`}
          >
            Clásico
          </button>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">
            {search || filterType !== "all" || filterDrinkStyle !== "all"
              ? "No se encontraron productos con los filtros actuales"
              : "No hay productos disponibles"}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <button
              key={product._id}
              onClick={() => onAddProduct(product)}
              className="w-full p-3 bg-surface-3 rounded-lg border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ivory truncate">{product.name}</p>
                  <p className="text-[10px] text-muted truncate">{product.category}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-gold">${product.price.toFixed(2)}</span>
                  {product.type === "drink" && product.drinkStyle && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold ${
                      product.drinkStyle === "author"
                        ? "bg-violet-500/20 text-violet-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {product.drinkStyle === "author" ? "Autor" : "Clásico"}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
