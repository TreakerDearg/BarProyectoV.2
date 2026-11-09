"use client";

import { useState } from "react";
import {
  X,
  Wine,
  ChefHat,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Printer,
  Pencil,
  Plus,
  AlertCircle,
  CheckCircle2,
  Package,
  GlassWater,
  Flame,
  Snowflake,
} from "lucide-react";
import type { Recipe } from "../types/recipe";

interface Props {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onAddVariant: (recipe: Recipe) => void;
  onSelectVariant?: (variantRecipe: Recipe) => void;
  allVariants?: Recipe[];
}

export default function RecipeDetailDrawer({
  recipe,
  isOpen,
  onClose,
  onEdit,
  onAddVariant,
  onSelectVariant,
  allVariants = [],
}: Props) {
  if (!isOpen || !recipe) return null;

  const isDrink = recipe.type === "drink";
  const productName =
    typeof recipe.product === "object" && recipe.product
      ? recipe.product.name
      : (recipe as any).name || "Ficha Técnica";

  const price =
    typeof recipe.product === "object" && recipe.product?.price
      ? recipe.product.price
      : 0;

  const cost = recipe.totalCost || 0;
  const profit = price - cost;
  const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

  const marginColor =
    margin >= 70 ? "text-emerald" : margin >= 50 ? "text-gold" : "text-red";
  const marginBadge =
    margin >= 70
      ? "bg-emerald/10 text-emerald border-emerald/20"
      : margin >= 50
      ? "bg-gold/10 text-gold border-gold/20"
      : "bg-red/10 text-red border-red/20";

  // Filter child variants of this master recipe
  const safeVariants = Array.isArray(allVariants) ? allVariants : [];
  const childVariants = safeVariants.filter(
    (v) => v && (v.parentId === recipe._id || (recipe.parentId && v.parentId === recipe.parentId))
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-10">
        <div className="w-screen max-w-xl bg-[#161B22] border-l border-[#30363D] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between bg-[#1C2333]">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  isDrink
                    ? "bg-[#388BFD]/15 text-[#388BFD] border-[#388BFD]/30"
                    : "bg-[#FF7B54]/15 text-[#FF7B54] border-[#FF7B54]/30"
                }`}
              >
                {isDrink ? (
                  <>
                    <Wine className="w-3.5 h-3.5" /> Barra & Cócteles
                  </>
                ) : (
                  <>
                    <ChefHat className="w-3.5 h-3.5" /> Cocina & Platos
                  </>
                )}
              </span>

              {recipe.variantName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/30">
                  <Sparkles className="w-3 h-3" />
                  {recipe.variantName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                title="Imprimir Ficha POS"
                className="p-2 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(recipe)}
                title="Editar Ficha"
                className="p-2 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title & Image Hero */}
            <div className="space-y-4">
              {recipe.image && (
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-[#30363D] bg-[#090E14] relative">
                  <img
                    src={recipe.image}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161B22] via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#8B949E]">
                      {recipe.category || "General"}
                    </span>
                    <h2 className="text-xl font-bold text-[#E6EDF3] leading-tight">
                      {productName}
                    </h2>
                  </div>
                </div>
              )}

              {!recipe.image && (
                <div className="border-b border-[#30363D] pb-3">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#8B949E]">
                    Categoría: {recipe.category || "General"}
                  </span>
                  <h2 className="text-2xl font-bold text-[#E6EDF3] leading-tight">
                    {productName}
                  </h2>
                </div>
              )}
            </div>

            {/* Financial & Escandallo Ribbon */}
            <div className="grid grid-cols-3 gap-3 bg-[#1C2333] rounded-2xl p-4 border border-[#30363D]">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#8B949E] font-medium block">
                  Costo Insumos
                </span>
                <span className="text-base font-bold text-[#E6EDF3] font-mono">
                  ${cost.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#8B949E] font-medium block">
                  Precio POS
                </span>
                <span className="text-base font-bold text-[#F0B429] font-mono">
                  ${price.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#8B949E] font-medium block">
                  Margen Bruto
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-base font-bold font-mono ${marginColor}`}>
                    {margin}%
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${marginBadge}`}>
                    {profit > 0 ? `+$${profit.toLocaleString()}` : "$0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Insumos & Escandallo Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#E6EDF3] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#F0B429]" />
                  Escandallo de Insumos ({recipe.ingredients?.length || 0})
                </h4>
                <span className="text-[11px] text-[#8B949E]">
                  Bóveda de Insumos vinculada
                </span>
              </div>

              <div className="border border-[#30363D] rounded-2xl overflow-hidden bg-[#1C2333] divide-y divide-[#30363D]">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ing, idx) => {
                    const item =
                      typeof ing.inventoryItem === "object" && ing.inventoryItem
                        ? ing.inventoryItem
                        : null;
                    const itemName = item?.name || "Insumo";
                    const itemUnit = ing.unit || item?.unit || "unit";
                    const itemStock = item?.stock !== undefined ? item.stock : null;
                    const isLow = itemStock !== null && itemStock <= 3;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 flex items-center justify-between hover:bg-[#21283A] transition-colors text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[#E6EDF3] block">
                            {itemName}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-[#8B949E]">
                            {itemStock !== null && (
                              <span
                                className={`inline-flex items-center gap-1 ${
                                  isLow ? "text-[#F85149]" : "text-[#3FB950]"
                                }`}
                              >
                                {isLow ? (
                                  <AlertCircle className="w-3 h-3" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                Stock: {itemStock} {item?.unit || ""}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-[#E6EDF3] block text-sm">
                            {ing.quantity} {itemUnit}
                          </span>
                          {item?.cost ? (
                            <span className="text-[11px] text-[#8B949E]">
                              ~${Math.round(item.cost * (ing.quantity / 1000 || 1)).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-[#8B949E]">
                    No se especificaron ingredientes para esta ficha.
                  </div>
                )}
              </div>
            </div>

            {/* Protocolo Operativo / Técnica & Servicio */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#E6EDF3] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#388BFD]" />
                Protocolo Operativo de Estación
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#1C2333] border border-[#30363D] rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] text-[#8B949E] uppercase font-medium flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#F0B429]" /> Método / Técnica
                  </span>
                  <span className="font-semibold text-[#E6EDF3] block">
                    {recipe.method || "Estándar"}
                  </span>
                </div>

                <div className="bg-[#1C2333] border border-[#30363D] rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] text-[#8B949E] uppercase font-medium flex items-center gap-1">
                    <GlassWater className="w-3 h-3 text-[#388BFD]" /> Cristalería / Vajilla
                  </span>
                  <span className="font-semibold text-[#E6EDF3] block">
                    {typeof recipe.specifications?.glassware === "string"
                      ? recipe.specifications.glassware
                      : (recipe.specifications?.glassware as any)?.name || "Vaso sugerido"}
                  </span>
                </div>

                {recipe.specifications?.ice && (
                  <div className="bg-[#1C2333] border border-[#30363D] rounded-2xl p-3.5 space-y-1">
                    <span className="text-[11px] text-[#8B949E] uppercase font-medium flex items-center gap-1">
                      <Snowflake className="w-3 h-3 text-[#388BFD]" /> Servicio de Hielo
                    </span>
                    <span className="font-semibold text-[#E6EDF3] block">
                      {typeof recipe.specifications.ice === "string"
                        ? recipe.specifications.ice
                        : (recipe.specifications.ice as any)?.name || "Cúbico"}
                    </span>
                  </div>
                )}

                {recipe.specifications?.decorations &&
                  recipe.specifications.decorations.length > 0 && (
                    <div className="bg-[#1C2333] border border-[#30363D] rounded-2xl p-3.5 space-y-1">
                      <span className="text-[11px] text-[#8B949E] uppercase font-medium block">
                        Garnish / Decoración
                      </span>
                      <span className="font-semibold text-[#E6EDF3] block">
                        {recipe.specifications.decorations
                          .map((d: any) => (typeof d === "string" ? d : d.name))
                          .join(", ")}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Preparation Steps */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#E6EDF3] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F0B429]" />
                Pasos de Elaboración ({recipe.steps?.length || 0})
              </h4>

              <div className="space-y-2">
                {recipe.steps && recipe.steps.length > 0 ? (
                  recipe.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#1C2333] border border-[#30363D] flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/30 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {st.stepNumber || idx + 1}
                      </span>
                      <p className="text-xs text-[#E6EDF3] leading-relaxed">
                        {st.instruction}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[#8B949E] bg-[#1C2333] rounded-2xl border border-[#30363D]">
                    No se especificaron pasos de elaboración para esta ficha.
                  </div>
                )}
              </div>
            </div>

            {/* Variantes del Ítem */}
            <div className="space-y-3 border-t border-[#30363D] pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#E6EDF3] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#F0B429]" />
                  Variantes Registradas ({childVariants.length})
                </h4>
                <button
                  onClick={() => onAddVariant(recipe)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/30 hover:bg-[#F0B429]/25 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Variante
                </button>
              </div>

              {childVariants.length > 0 ? (
                <div className="space-y-2.5">
                  {childVariants.map((variant) => {
                    const varPrice =
                      typeof variant.product === "object" && variant.product?.price
                        ? variant.product.price
                        : 0;
                    const varCost = variant.totalCost || 0;
                    return (
                      <div
                        key={variant._id}
                        onClick={() => onSelectVariant && onSelectVariant(variant)}
                        className="p-3.5 rounded-2xl bg-[#1C2333] border border-[#30363D] hover:border-[#F0B429]/60 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F0B429] ring-2 ring-[#0D1117]" />
                          <div>
                            <span className="text-xs font-bold text-[#E6EDF3] group-hover:text-[#F0B429] transition-colors block">
                              {variant.variantName || (variant.product as any)?.name || "Variante"}
                            </span>
                            <span className="text-[11px] text-[#8B949E]">
                              {variant.ingredients?.length || 0} insumos vinculados
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-[#F0B429] block">
                            ${varPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#8B949E] font-mono">
                            Costo: ${varCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#8B949E] bg-[#1C2333] p-4 rounded-2xl border border-[#30363D]">
                  Esta ficha no tiene variantes registradas (formatos, sustituciones o adaptaciones dietarias).
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[#30363D] bg-[#1C2333] flex items-center justify-between gap-3">
            <button
              onClick={() => onAddVariant(recipe)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#21283A] hover:bg-[#293042] text-[#E6EDF3] border border-[#30363D] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#F0B429]" />
              Nueva Variante
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(recipe)}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#F0B429] hover:bg-[#F5C842] text-[#0D1117] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar Ficha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

