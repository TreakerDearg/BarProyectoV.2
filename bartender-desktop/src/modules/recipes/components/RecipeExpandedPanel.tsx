"use client";

import { Beaker, DollarSign, Clock, Star, CheckCircle, AlertTriangle } from "lucide-react";
import type { Recipe } from "../types/recipe";

interface Props {
  recipe: Recipe;
}

export default function RecipeExpandedPanel({ recipe }: Props) {
  const ingredients = recipe.ingredients || [];
  const totalCost = recipe.totalCost || 0;
  const costPerPortion = totalCost > 0 ? totalCost : 0;

  return (
    <div className="space-y-6">
      {/* ================= INGREDIENTS SECTION ================= */}
      {ingredients.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker size={14} className="text-violet-400" />
              <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest">Ingredientes Completos</h4>
            </div>
            <span className="text-[10px] text-muted font-semibold">{ingredients.length} elementos</span>
          </div>

          <div className="space-y-2">
            {ingredients.map((ingredient: any, idx: number) => {
              const inventoryItem = ingredient.inventoryItem;
              const availableStock = inventoryItem?.stock || 0;
              const requiredQuantity = ingredient.quantity || 0;
              const isAvailable = availableStock >= requiredQuantity;
              const itemCost = inventoryItem?.cost || 0;
              const totalIngredientCost = itemCost * requiredQuantity;

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
                          {requiredQuantity} {ingredient.unit}
                        </span>
                        <span className="text-[10px] text-muted/50">·</span>
                        <span className={`text-[10px] font-semibold ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                          {availableStock} {inventoryItem?.unit || ingredient.unit} disponible
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4">
                    <span className="text-[10px] font-black text-gold">
                      ${totalIngredientCost.toFixed(2)}
                    </span>
                    <span className="text-[8px] text-muted">
                      ${itemCost.toFixed(2)}/{ingredient.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= COST BREAKDOWN SECTION ================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-gold" />
          <h4 className="text-xs font-black text-gold uppercase tracking-widest">Desglose de Costos</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Costo Total</p>
            <p className="text-sm font-black text-ivory">${totalCost.toFixed(2)}</p>
          </div>
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Por Porción</p>
            <p className="text-sm font-black text-emerald-400">${costPerPortion.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
          <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Costo por Ingrediente</p>
          <div className="space-y-1">
            {ingredients.map((ingredient: any, idx: number) => {
              const inventoryItem = ingredient.inventoryItem;
              const itemCost = inventoryItem?.cost || 0;
              const totalIngredientCost = itemCost * ingredient.quantity;
              const percentage = totalCost > 0 ? (totalIngredientCost / totalCost) * 100 : 0;

              return (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted truncate flex-1">
                    {inventoryItem?.name || "Ítem desconocido"}
                  </span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-[10px] font-semibold text-ivory">
                      ${totalIngredientCost.toFixed(2)}
                    </span>
                    <span className="text-[8px] text-muted/70">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= PREPARATION INFO SECTION ================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-cyan-400" />
          <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest">Información de Preparación</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Tiempo Est.</p>
            <p className="text-sm font-black text-ivory">5-10 min</p>
          </div>
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Dificultad</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <Star key={i} size={12} className={i <= 2 ? "text-gold fill-gold" : "text-muted/30"} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= NO INGREDIENTS MESSAGE ================= */}
      {ingredients.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-6 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
          <Beaker size={14} className="text-muted/50" />
          <p className="text-xs text-muted/50 font-semibold">Esta receta no tiene ingredientes</p>
        </div>
      )}
    </div>
  );
}
