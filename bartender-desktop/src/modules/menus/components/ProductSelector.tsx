"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Martini, Utensils, CheckCircle } from "lucide-react";
import type { Product } from "../../../types/product";
import ProductMiniCard from "./ProductMiniCard";

interface Props {
  products: Product[];
  onAddProduct: (product: Product) => void;
  addedProductIds: Set<string>;
}

export default function ProductSelector({ products, onAddProduct, addedProductIds }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "drink" | "food">("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || product.type === filterType;
      const notAdded = !addedProductIds.has(product._id!);
      return matchesSearch && matchesType && notAdded;
    });
  }, [products, searchQuery, filterType, addedProductIds]);

  const availableCount = products.filter(p => p.available).length;
  const totalCount = products.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-ivory uppercase tracking-widest">Seleccionar Productos</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/10">
            <CheckCircle size={10} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400">
              {availableCount}/{totalCount} disponibles
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ivory placeholder:text-muted/50 text-xs focus:outline-none focus:border-rose/40 transition-all"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
              filterType === "all"
                ? "bg-rose/10 border border-rose/30 text-rose-300"
                : "bg-white/5 border border-white/10 text-muted hover:border-white/20"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType("drink")}
            className={`px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
              filterType === "drink"
                ? "bg-rose/10 border border-rose/30 text-rose-300"
                : "bg-white/5 border border-white/10 text-muted hover:border-white/20"
            }`}
          >
            <Martini size={12} className="inline mr-1" />
            Bebidas
          </button>
          <button
            onClick={() => setFilterType("food")}
            className={`px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
              filterType === "food"
                ? "bg-rose/10 border border-rose/30 text-rose-300"
                : "bg-white/5 border border-white/10 text-muted hover:border-white/20"
            }`}
          >
            <Utensils size={12} className="inline mr-1" />
            Comidas
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
            <Filter size={24} className="text-muted/30" />
            <p className="text-xs text-muted/50 font-semibold">
              {searchQuery || filterType !== "all"
                ? "No se encontraron productos"
                : "Todos los productos han sido agregados"}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductMiniCard
              key={product._id}
              product={product}
              onAdd={onAddProduct}
              isAdded={false}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-[10px] text-muted font-semibold">
          {filteredProducts.length} productos disponibles
        </span>
        <span className="text-[10px] text-muted/50 font-semibold">
          {addedProductIds.size} agregados
        </span>
      </div>
    </div>
  );
}
