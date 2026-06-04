"use client";

import { Martini, Beaker, AlertTriangle, TrendingUp } from "lucide-react";
import type { InventoryItem } from "../types/inventory";

interface Props {
  item: InventoryItem;
}

export default function InventoryExpandedPanel({ item }: Props) {
  const usedInRecipes = item.usedInRecipes || [];
  const usedInProducts = item.usedInProducts || [];

  return (
    <div className="space-y-6">
      {/* ================= PRODUCTS SECTION ================= */}
      {usedInProducts && usedInProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Martini size={14} className="text-gold" />
              <h4 className="text-xs font-black text-gold uppercase tracking-widest">Productos que usan este insumo</h4>
            </div>
            <span className="text-[10px] text-muted font-semibold">{usedInProducts.length} productos</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {usedInProducts.map((productId: string, idx: number) => (
              <div
                key={idx}
                className="px-3 py-2 bg-gold/10 border border-gold/20 rounded-lg flex items-center gap-2"
              >
                <Martini size={10} className="text-gold" />
                <span className="text-[10px] font-semibold text-gold/90">Producto #{productId.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= RECIPES SECTION ================= */}
      {usedInRecipes && usedInRecipes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker size={14} className="text-violet-400" />
              <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest">Recetas que usan este insumo</h4>
            </div>
            <span className="text-[10px] text-muted font-semibold">{usedInRecipes.length} recetas</span>
          </div>

          <div className="space-y-2">
            {usedInRecipes.map((recipe: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-violet/10">
                    <Beaker size={12} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ivory/90 truncate">
                      {recipe.productName || "Producto desconocido"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted">
                        Cantidad: {recipe.quantity} {recipe.unit}
                      </span>
                      <span className="text-[10px] text-muted/50">·</span>
                      <span className="text-[10px] font-semibold text-gold">
                        ${recipe.productPrice?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= STOCK TREND SECTION ================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-400" />
          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Tendencia de Consumo</h4>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Stock Actual</p>
            <p className="text-sm font-black text-ivory">{item.stock} {item.unit}</p>
          </div>
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Mínimo</p>
            <p className="text-sm font-black text-amber-400">{item.minStock} {item.unit}</p>
          </div>
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Máximo</p>
            <p className="text-sm font-black text-emerald-400">{item.maxStock} {item.unit}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-3 bg-white/[0.02] rounded-xl border border-white/5">
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="text-[10px] text-muted font-semibold">Sin datos de tendencia suficientes</span>
        </div>
      </div>

      {/* ================= NO USAGE MESSAGE ================= */}
      {(!usedInProducts || usedInProducts.length === 0) && (!usedInRecipes || usedInRecipes.length === 0) && (
        <div className="flex items-center justify-center gap-2 py-6 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
          <AlertTriangle size={14} className="text-muted/50" />
          <p className="text-xs text-muted/50 font-semibold">Este insumo no está siendo utilizado en ningún producto o receta</p>
        </div>
      )}
    </div>
  );
}
