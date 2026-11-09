"use client";

import { X, Martini, Beaker, AlertTriangle, TrendingUp, Package, MapPin, DollarSign, Activity, Pencil, Trash2 } from "lucide-react";
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
    critical: { label: "CRÍTICO", bgColor: "bg-[rgba(248,81,73,0.12)]", textColor: "text-[#F85149]", borderColor: "border-[rgba(248,81,73,0.30)]", barColor: "bg-[#F85149]" },
    low:      { label: "BAJO",    bgColor: "bg-[rgba(255,123,84,0.12)]", textColor: "text-[#FF7B54]", borderColor: "border-[rgba(255,123,84,0.30)]", barColor: "bg-[#FF7B54]" },
    optimal:  { label: "ÓPTIMO",  bgColor: "bg-[rgba(63,185,80,0.12)]", textColor: "text-[#3FB950]", borderColor: "border-[rgba(63,185,80,0.30)]", barColor: "bg-[#3FB950]" },
  }[status];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[90] transition-opacity duration-300"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#161B22] border-l border-[#30363D] z-[100] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-5 border-b border-[#30363D] flex items-center justify-between shrink-0 bg-[#161B22]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[rgba(240,180,41,0.12)] text-[#F0B429] border border-[rgba(240,180,41,0.25)] rounded-xl">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#E6EDF3] tracking-tight">{item.name}</h2>
              <p className="text-xs text-[#8B949E] uppercase tracking-wider">{item.category || "Insumo"}</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-[#21283A] text-[#8B949E] hover:text-[#E6EDF3] rounded-xl border border-transparent hover:border-[#30363D] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {/* Status Badge */}
          <div className={`p-4 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor} space-y-2.5`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8B949E]">Estado del Stock</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2.5 bg-[#0D1117] rounded-full overflow-hidden border border-[#30363D]">
                  <div
                    className={`h-full transition-all duration-500 ${statusConfig.barColor}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              <span className={`text-xl font-black ${statusConfig.textColor}`}>
                {percent.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#8B949E]">
              <span>Stock actual: <strong className="text-[#E6EDF3]">{stock} {item.unit}</strong></span>
              <span>Mín: {minStock} · Máx: {maxStock}</span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#0D1117] rounded-xl border border-[#30363D]">
              <div className="flex items-center gap-1.5 mb-1 text-xs text-[#8B949E]">
                <DollarSign size={14} className="text-[#F0B429]" />
                <span>Costo Unitario</span>
              </div>
              <p className="text-base font-black text-[#E6EDF3]">${cost.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3.5 bg-[#0D1117] rounded-xl border border-[#30363D]">
              <div className="flex items-center gap-1.5 mb-1 text-xs text-[#8B949E]">
                <Activity size={14} className="text-[#3FB950]" />
                <span>Valor Total</span>
              </div>
              <p className="text-base font-black text-[#F0B429]">${totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3.5 bg-[#0D1117] rounded-xl border border-[#30363D]">
              <div className="flex items-center gap-1.5 mb-1 text-xs text-[#8B949E]">
                <MapPin size={14} className="text-[#388BFD]" />
                <span>Ubicación</span>
              </div>
              <p className="text-xs font-bold text-[#E6EDF3] capitalize truncate">{item.location || "Bóveda Central"}</p>
            </div>
            <div className="p-3.5 bg-[#0D1117] rounded-xl border border-[#30363D]">
              <div className="flex items-center gap-1.5 mb-1 text-xs text-[#8B949E]">
                <Package size={14} className="text-[#F0B429]" />
                <span>Sector Operativo</span>
              </div>
              <p className="text-xs font-bold text-[#E6EDF3] capitalize">{item.sector}</p>
            </div>
          </div>

          {/* Products Section */}
          {usedInProducts && usedInProducts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#30363D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Martini size={15} className="text-[#F0B429]" />
                  <h4 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
                    Productos que usan este insumo
                  </h4>
                </div>
                <span className="text-xs text-[#8B949E] font-semibold">{usedInProducts.length} productos</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {usedInProducts.map((productId: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-xl flex items-center gap-2 text-xs font-semibold text-[#E6EDF3]"
                  >
                    <Martini size={12} className="text-[#F0B429]" />
                    <span>Producto #{productId.slice(0, 8)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipes Section */}
          {usedInRecipes && usedInRecipes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#30363D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beaker size={15} className="text-[#388BFD]" />
                  <h4 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
                    Recetas vinculadas
                  </h4>
                </div>
                <span className="text-xs text-[#8B949E] font-semibold">{usedInRecipes.length} recetas</span>
              </div>
              <div className="space-y-2">
                {usedInRecipes.map((recipe: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#0D1117] p-3 rounded-xl border border-[#30363D]"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-[rgba(56,139,253,0.12)] text-[#388BFD]">
                        <Beaker size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#E6EDF3] truncate">
                          {recipe.productName || "Receta sin nombre"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8B949E]">
                          <span>Dosis: {recipe.quantity} {recipe.unit}</span>
                          <span>·</span>
                          <span className="font-semibold text-[#F0B429]">
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

          {/* No Usage Message */}
          {(!usedInProducts || usedInProducts.length === 0) && (!usedInRecipes || usedInRecipes.length === 0) && (
            <div className="flex items-center justify-center gap-2 py-6 bg-[#0D1117] rounded-xl border border-dashed border-[#30363D] text-xs text-[#8B949E]">
              <AlertTriangle size={14} />
              <span>Este insumo aún no está vinculado a ninguna receta o producto activo.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#30363D] shrink-0 flex gap-3 bg-[#161B22]">
          {onEdit && (
            <button
              onClick={() => { onEdit(item); closeDrawer(); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F0B429] hover:bg-[#D99B16] text-[#0D1117] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-[#F0B429]/20"
            >
              <Pencil size={14} />
              <span>Editar Insumo</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => { if (confirm("¿Eliminar este insumo de la bóveda?")) { onDelete(item._id!); closeDrawer(); } }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[rgba(248,81,73,0.12)] hover:bg-[rgba(248,81,73,0.22)] border border-[rgba(248,81,73,0.30)] text-[#F85149] font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              <Trash2 size={14} />
              <span>Eliminar</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
