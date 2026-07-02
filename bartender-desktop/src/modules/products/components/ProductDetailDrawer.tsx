"use client";

import { X, Martini, UtensilsCrossed, Beaker, AlertTriangle, CheckCircle, Layers, DollarSign, Activity, Package, Star, Clock, Tag, Zap } from "lucide-react";
import type { Product } from "../../../types/product";
import { useProductUiStore } from "../store/productUiStore";

interface Props {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export default function ProductDetailDrawer({ product, onEdit, onDelete }: Props) {
  const { closeDrawer } = useProductUiStore();
  const recipe = product.recipe;
  const ingredients = recipe?.ingredients || [];
  const menuIds = product.menuIds || [];

  const price = product.price ?? 0;
  const dynamicPrice = (product.dynamicPrice ?? price) as number;
  const cost = product.cost ?? 0;
  const margin = dynamicPrice > 0 ? Math.round(((dynamicPrice - cost) / dynamicPrice) * 100) : 0;

  const isDrink = product.type === "drink";
  const typeTheme = {
    drink: {
      gradient: "from-gold/20 via-amber-500/15 to-orange-500/10",
      borderColor: "border-gold/30",
      icon: <Martini size={20} className="text-gold" />,
      primaryColor: "text-gold",
    },
    food: {
      gradient: "from-emerald-500/20 via-green-500/15 to-teal-500/10",
      borderColor: "border-emerald/30",
      icon: <UtensilsCrossed size={20} className="text-emerald-400" />,
      primaryColor: "text-emerald-400",
    }
  }[product.type || "drink"];

  const statusConfig = product.available
    ? { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald/30", label: "DISPONIBLE" }
    : { color: "text-red-400", bg: "bg-red-500/10", border: "border-red/30", label: "NO DISPONIBLE" };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg md:max-w-md lg:max-w-lg bg-surface-3 border-l border-white/10 z-[100] shadow-2xl animate-slide-in-right">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className={`sticky top-0 z-10 p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-gradient-to-br ${typeTheme.gradient} backdrop-blur-md`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-br ${typeTheme.gradient} rounded-xl border ${typeTheme.borderColor}`}>
                {typeTheme.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-ivory">{product.name}</h2>
                <p className="text-xs text-muted">{product.category || 'General'} · {isDrink ? 'Bebida' : 'Comida'}</p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Status Badge */}
            <div className={`p-4 rounded-xl border ${statusConfig.bg} ${statusConfig.border}`}>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                  {statusConfig.label}
                </span>
                {product.featured && (
                  <div className="flex items-center gap-1 text-gold">
                    <Star size={14} className="fill-gold" />
                    <span className="text-xs font-bold">Destacado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-gold" />
                  <span className="text-xs text-muted">Precio</span>
                </div>
                <p className="text-lg font-bold text-ivory">${dynamicPrice.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-cyan" />
                  <span className="text-xs text-muted">Margen</span>
                </div>
                <p className={`text-lg font-bold ${margin > 50 ? 'text-emerald-400' : margin > 30 ? 'text-cyan-400' : 'text-gold'}`}>
                  {margin}%
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={16} className="text-violet-400" />
                  <span className="text-xs text-muted">Costo</span>
                </div>
                <p className="text-lg font-bold text-ivory">${cost.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-amber-400" />
                  <span className="text-xs text-muted">Preparación</span>
                </div>
                <p className="text-lg font-bold text-ivory">{product.preparationTime || 5} min</p>
              </div>
            </div>

            {/* INGREDIENT MAPPING SECTION */}
            {recipe && ingredients.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Beaker size={16} className="text-gold" />
                    <h4 className="text-sm font-bold text-gold uppercase tracking-wider">Mapeo de Ingredientes</h4>
                  </div>
                  <span className="text-xs text-muted font-semibold">{ingredients.length} ingredientes</span>
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

            {/* MENUS SECTION */}
            {menuIds && menuIds.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-violet-400" />
                    <h4 className="text-sm font-bold text-violet-400 uppercase tracking-wider">Menús Asociados</h4>
                  </div>
                  <span className="text-xs text-muted font-semibold">{menuIds.length} menús</span>
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

            {/* COST BREAKDOWN */}
            {recipe && recipe.totalCost && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gold" />
                  <h4 className="text-sm font-bold text-gold uppercase tracking-wider">Desglose de Costos</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted font-black uppercase tracking-wider mb-1">Costo Receta</p>
                    <p className="text-sm font-black text-ivory">${recipe.totalCost.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted font-black uppercase tracking-wider mb-1">Precio Venta</p>
                    <p className="text-sm font-black text-emerald-400">${product.price?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ADDITIONAL INFO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-cyan" />
                <h4 className="text-sm font-bold text-cyan uppercase tracking-wider">Información Adicional</h4>
              </div>
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-violet-500/20 text-violet-300 rounded border border-violet/30">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {product.description && (
                <p className="text-xs text-white/60 mt-2">{product.description}</p>
              )}
            </div>

            {/* NO RECIPE MESSAGE */}
            {!recipe && (
              <div className="flex items-center justify-center gap-2 py-6 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                <Beaker size={16} className="text-muted/50" />
                <p className="text-xs text-muted/50 font-semibold">Este producto no tiene receta asociada</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 z-10 p-4 border-t border-white/10 shrink-0 flex gap-3 bg-surface-3 backdrop-blur-md">
            {onEdit && (
              <button
                onClick={() => { onEdit(product); closeDrawer(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan/20 border border-cyan/30 text-cyan hover:bg-cyan/30 rounded-xl transition-colors font-semibold text-sm"
              >
                <Zap size={16} />
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => { if (confirm("¿Eliminar este producto?")) { onDelete(product._id!); closeDrawer(); } }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red/20 border border-red/30 text-red hover:bg-red/30 rounded-xl transition-colors font-semibold text-sm"
              >
                <X size={16} />
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
