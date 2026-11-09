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
  const childVariants = allVariants.filter(
    (v) => v.parentId === recipe._id || (recipe.parentId && v.parentId === recipe.parentId)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-surface-card border-l border-border/70 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-surface-dark/60">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  isDrink
                    ? "bg-cyan/10 text-cyan border-cyan/30"
                    : "bg-amber/10 text-amber border-amber/30"
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
                  <Sparkles className="w-3 h-3" />
                  {recipe.variantName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                title="Imprimir Ficha POS"
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(recipe)}
                title="Editar Ficha"
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
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
                <div className="w-full h-48 rounded-xl overflow-hidden border border-border/60 bg-surface-dark relative">
                  <img
                    src={recipe.image}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                      {recipe.category || "General"}
                    </span>
                    <h2 className="text-xl font-bold text-text-primary leading-tight">
                      {productName}
                    </h2>
                  </div>
                </div>
              )}

              {!recipe.image && (
                <div className="border-b border-border/50 pb-3">
                  <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                    Categoría: {recipe.category || "General"}
                  </span>
                  <h2 className="text-2xl font-bold text-text-primary leading-tight">
                    {productName}
                  </h2>
                </div>
              )}
            </div>

            {/* Financial & Escandallo Ribbon */}
            <div className="grid grid-cols-3 gap-3 bg-surface-dark/70 rounded-xl p-3.5 border border-border/60">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium block">
                  Costo Insumos
                </span>
                <span className="text-base font-bold text-text-primary">
                  ${cost.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium block">
                  Precio POS
                </span>
                <span className="text-base font-bold text-text-primary">
                  ${price.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium block">
                  Margen Bruto
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-base font-bold ${marginColor}`}>
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
                <h4 className="text-xs uppercase tracking-wider font-bold text-text-primary flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-gold" />
                  Escandallo de Insumos ({recipe.ingredients?.length || 0})
                </h4>
                <span className="text-[11px] text-text-muted">
                  Bóveda de Insumos vinculada
                </span>
              </div>

              <div className="border border-border/60 rounded-xl overflow-hidden bg-surface-dark/40 divide-y divide-border/40">
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
                        className="p-3 flex items-center justify-between hover:bg-surface-card/40 transition-colors text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-text-primary block">
                            {itemName}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-text-muted">
                            {itemStock !== null && (
                              <span
                                className={`inline-flex items-center gap-1 ${
                                  isLow ? "text-red" : "text-emerald"
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
                          <span className="font-mono font-bold text-text-primary block text-sm">
                            {ing.quantity} {itemUnit}
                          </span>
                          {item?.cost ? (
                            <span className="text-[11px] text-text-muted">
                              ~${Math.round(item.cost * (ing.quantity / 1000 || 1)).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-text-muted">
                    No se especificaron ingredientes para esta ficha.
                  </div>
                )}
              </div>
            </div>

            {/* Protocolo Operativo / Técnica & Servicio */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan" />
                Protocolo Operativo de Estación
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-surface-dark/40 border border-border/50 rounded-xl p-3 space-y-1">
                  <span className="text-[11px] text-text-muted uppercase font-medium flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber" /> Método / Técnica
                  </span>
                  <span className="font-semibold text-text-primary block">
                    {recipe.method || "Estándar"}
                  </span>
                </div>

                <div className="bg-surface-dark/40 border border-border/50 rounded-xl p-3 space-y-1">
                  <span className="text-[11px] text-text-muted uppercase font-medium flex items-center gap-1">
                    <GlassWater className="w-3 h-3 text-cyan" /> Cristalería / Vajilla
                  </span>
                  <span className="font-semibold text-text-primary block">
                    {typeof recipe.specifications?.glassware === "string"
                      ? recipe.specifications.glassware
                      : (recipe.specifications?.glassware as any)?.name || "Vaso sugerido"}
                  </span>
                </div>

                {recipe.specifications?.ice && (
                  <div className="bg-surface-dark/40 border border-border/50 rounded-xl p-3 space-y-1">
                    <span className="text-[11px] text-text-muted uppercase font-medium flex items-center gap-1">
                      <Snowflake className="w-3 h-3 text-cyan" /> Servicio de Hielo
                    </span>
                    <span className="font-semibold text-text-primary block">
                      {typeof recipe.specifications.ice === "string"
                        ? recipe.specifications.ice
                        : (recipe.specifications.ice as any)?.name || "Cúbico"}
                    </span>
                  </div>
                )}

                {recipe.specifications?.decorations &&
                  recipe.specifications.decorations.length > 0 && (
                    <div className="bg-surface-dark/40 border border-border/50 rounded-xl p-3 space-y-1">
                      <span className="text-[11px] text-text-muted uppercase font-medium block">
                        Garnish / Decoración
                      </span>
                      <span className="font-semibold text-text-primary block">
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
              <h4 className="text-xs uppercase tracking-wider font-bold text-text-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold" />
                Pasos de Elaboración ({recipe.steps?.length || 0})
              </h4>

              <div className="space-y-2">
                {recipe.steps && recipe.steps.length > 0 ? (
                  recipe.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-dark/40 border border-border/50 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {st.stepNumber || idx + 1}
                      </span>
                      <p className="text-xs text-text-primary leading-relaxed">
                        {st.instruction}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-text-muted bg-surface-dark/30 rounded-xl border border-border/40">
                    No se especificaron pasos de elaboración para esta ficha.
                  </div>
                )}
              </div>
            </div>

            {/* Variantes del Ítem */}
            <div className="space-y-3 border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-bold text-text-primary flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gold" />
                  Variantes Registradas ({childVariants.length})
                </h4>
                <button
                  onClick={() => onAddVariant(recipe)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Nueva Variante
                </button>
              </div>

              {childVariants.length > 0 ? (
                <div className="space-y-2">
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
                        className="p-2.5 rounded-xl bg-surface-dark/50 border border-border/50 hover:border-gold/40 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gold" />
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">
                              {variant.variantName || (variant.product as any)?.name || "Variante"}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {variant.ingredients?.length || 0} insumos
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-text-primary block">
                            ${varPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            Costo: ${varCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-text-muted bg-surface-dark/30 p-3 rounded-xl border border-border/40">
                  Esta ficha no tiene variantes registradas (formatos, sustituciones o adaptaciones dietarias).
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/60 bg-surface-dark/70 flex items-center justify-between gap-3">
            <button
              onClick={() => onAddVariant(recipe)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-surface-card hover:bg-surface-hover text-text-primary border border-border/60 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-gold" />
              + Variante
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(recipe)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-gold hover:bg-gold-hover text-surface-dark font-semibold transition-colors flex items-center gap-1.5"
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

