"use client";

import { Beaker, AlertTriangle, CheckCircle, Layers, DollarSign } from "lucide-react";
import type { Product } from "../../../types/product";

interface Props {
  product: Product;
}

export default function ProductExpandedPanel({ product }: Props) {
  const recipe = product.recipe;
  const ingredients = recipe?.ingredients || [];
  const menuIds = product.menuIds || [];

  return (
    <div className="space-y-6">
      {/* ================= INGREDIENTS SECTION ================= */}
      {recipe && ingredients.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker size={14} className="text-gold" />
              <h4 className="text-xs font-black text-gold uppercase tracking-widest">Ingredientes de Receta</h4>
            </div>
            <span className="text-[10px] text-muted font-semibold">{ingredients.length} elementos</span>
          </div>

          <div className="space-y-2">
            {ingredients.map((ingredient: any, idx: number) => {
              const inventoryItem = ingredient.inventoryItem;
              const availableStock = inventoryItem?.stock || 0;
              const requiredQuantity = ingredient.quantity || 0;
              const isAvailable = availableStock >= requiredQuantity;
              const stockPercent = availableStock > 0 ? (availableStock / requiredQuantity) * 100 : 0;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${isAvailable ? 'bg-emerald/10' : 'bg-red/10'}`}>
                      {isAvailable ? (
                        <CheckCircle size={12} className="text-emerald-400" />
                      ) : (
                        <AlertTriangle size={12} className="text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ivory/90 truncate">
                        {inventoryItem?.name || "Ítem desconocido"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted">
                          Requerido: {requiredQuantity} {ingredient.unit}
                        </span>
                        <span className="text-[10px] text-muted/50">·</span>
                        <span className={`text-[10px] font-semibold ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                          Disponible: {availableStock} {inventoryItem?.unit || ingredient.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4">
                    <span className="text-[10px] font-black text-muted">
                      {stockPercent.toFixed(0)}%
                    </span>
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(100, stockPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MENUS SECTION ================= */}
      {menuIds && menuIds.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-violet-400" />
            <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest">Menús Asociados</h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {menuIds.map((menuId: string, idx: number) => (
              <div
                key={idx}
                className="px-3 py-2 bg-violet/10 border border-violet/20 rounded-lg flex items-center gap-2"
              >
                <Layers size={10} className="text-violet-400" />
                <span className="text-[10px] font-semibold text-violet-300">Menú #{menuId.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= COST BREAKDOWN ================= */}
      {recipe && recipe.totalCost && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-gold" />
            <h4 className="text-xs font-black text-gold uppercase tracking-widest">Desglose de Costos</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Costo Receta</p>
              <p className="text-sm font-black text-ivory">${recipe.totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Precio Venta</p>
              <p className="text-sm font-black text-emerald-400">${product.price?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= NO RECIPE MESSAGE ================= */}
      {!recipe && (
        <div className="flex items-center justify-center gap-2 py-6 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
          <Beaker size={14} className="text-muted/50" />
          <p className="text-xs text-muted/50 font-semibold">Este producto no tiene receta asociada</p>
        </div>
      )}
    </div>
  );
}
