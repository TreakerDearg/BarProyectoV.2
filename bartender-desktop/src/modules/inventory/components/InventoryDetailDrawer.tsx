"use client";

import { X, Martini, Beaker, AlertTriangle, TrendingUp, Package, MapPin, DollarSign, Activity } from "lucide-react";
import type { InventoryItem } from "../types/inventory";
import { useInventoryUiStore } from "../store/inventoryUiStore";

interface Props {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
}

export default function InventoryDetailDrawer({ item, onEdit, onDelete }: Props) {
  const { closeDrawer } = useInventoryUiStore();
  const usedInRecipes = item.usedInRecipes || [];
  const usedInProducts = item.usedInProducts || [];

  const stock = Number(item.stock ?? 0);
  const minStock = Number(item.minStock ?? 0);
  const maxStock = Number(item.maxStock ?? 100);
  const cost = Number(item.cost ?? 0);
  const totalValue = stock * cost;
  const percent = Math.min((stock / maxStock) * 100, 100);
  const status = stock <= minStock ? "critical" : stock <= minStock * 1.5 ? "low" : "optimal";

  const statusConfig = {
    critical: { color: "red", label: "CRÍTICO", bgColor: "bg-red-500/10", textColor: "text-red-400", borderColor: "border-red/30" },
    low: { color: "amber", label: "BAJO", bgColor: "bg-amber-500/10", textColor: "text-amber-400", borderColor: "border-amber/30" },
    optimal: { color: "emerald", label: "ÓPTIMO", bgColor: "bg-emerald-500/10", textColor: "text-emerald-400", borderColor: "border-emerald/30" },
  }[status];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-surface-3 border-l border-white/10 z-[100] shadow-2xl animate-slide-in-right">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 rounded-xl border border-violet-500/20">
                <Package className="text-violet-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ivory">{item.name}</h2>
                <p className="text-xs text-muted">{item.category || "Sin categoría"}</p>
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Badge */}
            <div className={`p-4 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted font-semibold">Estado del Stock</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        status === "critical" ? "bg-red-500" :
                        status === "low" ? "bg-amber-500" :
                        "bg-emerald-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
                <span className={`text-2xl font-bold ${statusConfig.textColor}`}>
                  {percent.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-white/50">
                <span>{stock} {item.unit}</span>
                <span>Min: {minStock} · Max: {maxStock}</span>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-gold" />
                  <span className="text-xs text-muted">Costo Unitario</span>
                </div>
                <p className="text-lg font-bold text-ivory">${cost.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-cyan" />
                  <span className="text-xs text-muted">Valor Total</span>
                </div>
                <p className="text-lg font-bold text-gold">${totalValue.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-cyan" />
                  <span className="text-xs text-muted">Ubicación</span>
                </div>
                <p className="text-sm font-semibold text-ivory truncate">{item.location || "Bóveda Central"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={16} className="text-violet-400" />
                  <span className="text-xs text-muted">Sector</span>
                </div>
                <p className="text-sm font-semibold text-ivory capitalize">{item.sector}</p>
              </div>
            </div>

            {/* Products Section */}
            {usedInProducts && usedInProducts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Martini size={16} className="text-gold" />
                    <h4 className="text-sm font-bold text-gold uppercase tracking-wider">Productos que usan este insumo</h4>
                  </div>
                  <span className="text-xs text-muted font-semibold">{usedInProducts.length} productos</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {usedInProducts.map((productId: string, idx: number) => (
                    <div
                      key={idx}
                      className="px-3 py-2 bg-gold/10 border border-gold/20 rounded-lg flex items-center gap-2"
                    >
                      <Martini size={12} className="text-gold" />
                      <span className="text-xs font-semibold text-gold/90">Producto #{productId.slice(0, 8)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recipes Section */}
            {usedInRecipes && usedInRecipes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Beaker size={16} className="text-violet-400" />
                    <h4 className="text-sm font-bold text-violet-400 uppercase tracking-wider">Recetas que usan este insumo</h4>
                  </div>
                  <span className="text-xs text-muted font-semibold">{usedInRecipes.length} recetas</span>
                </div>
                <div className="space-y-2">
                  {usedInRecipes.map((recipe: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-violet/10">
                          <Beaker size={14} className="text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-ivory/90 truncate">
                            {recipe.productName || "Producto desconocido"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted">
                              Cantidad: {recipe.quantity} {recipe.unit}
                            </span>
                            <span className="text-xs text-muted/50">·</span>
                            <span className="text-xs font-semibold text-gold">
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

            {/* Stock Trend Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Tendencia de Stock</h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-xs text-muted font-black uppercase tracking-wider mb-1">Actual</p>
                  <p className="text-lg font-black text-ivory">{stock} {item.unit}</p>
                </div>
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-xs text-muted font-black uppercase tracking-wider mb-1">Mínimo</p>
                  <p className="text-lg font-black text-amber-400">{minStock} {item.unit}</p>
                </div>
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-xs text-muted font-black uppercase tracking-wider mb-1">Máximo</p>
                  <p className="text-lg font-black text-emerald-400">{maxStock} {item.unit}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 py-4 bg-white/[0.02] rounded-xl border border-white/5">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-xs text-muted font-semibold">Sin datos de tendencia suficientes</span>
              </div>
            </div>

            {/* No Usage Message */}
            {(!usedInProducts || usedInProducts.length === 0) && (!usedInRecipes || usedInRecipes.length === 0) && (
              <div className="flex items-center justify-center gap-2 py-6 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                <AlertTriangle size={16} className="text-muted/50" />
                <p className="text-sm text-muted/50 font-semibold">Este insumo no está siendo utilizado en ningún producto o receta</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 shrink-0 flex gap-3">
            {onEdit && (
              <button
                onClick={() => { onEdit(item); closeDrawer(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan/20 border border-cyan/30 text-cyan hover:bg-cyan/30 rounded-xl transition-colors font-semibold text-sm"
              >
                <Package size={16} />
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => { if (confirm("¿Eliminar este insumo?")) { onDelete(item._id!); closeDrawer(); } }}
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
