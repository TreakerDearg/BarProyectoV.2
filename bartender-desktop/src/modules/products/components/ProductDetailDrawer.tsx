"use client";

import { X, Martini, UtensilsCrossed, Beaker, AlertTriangle, CheckCircle, Layers, DollarSign, Activity, Package, Star, Clock, Tag, Zap, Pencil, Trash2 } from "lucide-react";
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

  const statusConfig = product.available
    ?{ color: "text-[#3FB950]", bg: "bg-[rgba(63,185,80,0.12)]", border: "border-[rgba(63,185,80,0.30)]", label: "DISPONIBLE" }
    : { color: "text-[#F85149]", bg: "bg-[rgba(248,81,73,0.12)]", border: "border-[rgba(248,81,73,0.30)]", label: "NO DISPONIBLE" };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[90] transition-opacity duration-300"
        onClick={closeDrawer}
      />

      {/* Drawer */}
              <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#161B22] border-l border-[#30363D] z-[100] shadow-2xl animate-slide-in-right flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-[#30363D] flex items-center justify-between shrink-0 bg-[#1C2333]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${isDrink
                        ? "bg-[rgba(240,180,41,0.12)] border-[rgba(240,180,41,0.30)] text-[#F0B429]"
                        : "bg-[rgba(63,185,80,0.12)] border-[rgba(63,185,80,0.30)] text-[#3FB950]"
                      }`}>
                      {isDrink ? <Martini size={20} /> : <UtensilsCrossed size={20} />}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#E6EDF3] leading-snug">{product.name}</h2>
                      <p className="text-xs text-[#8B949E] mt-0.5">
                        {product.category || "General"} · {isDrink ? "Bebida" : "Comida"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="p-2 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                      {/* Content Scroll */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                        {/* Status Badge */}
                        <div className={`p-3.5 rounded-xl border ${statusConfig.bg} ${statusConfig.border} flex items-center justify-between`}>
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          {product.featured && (
                            <div className="flex items-center gap-1.5 text-[#F0B429] bg-[#161B22] px-2.5 py-1 rounded-md border border-[rgba(240,180,41,0.30)]">
                              <Star size={13} className="fill-[#F0B429]" />
                              <span className="text-xs font-bold">Destacado</span>
                            </div>
            )}
                      </div>

                          {/* Quick Info Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3.5 bg-[#1C2333] rounded-xl border border-[#30363D]">
                              <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#8B949E]">
                                <DollarSign size={14} className="text-[#F0B429]" />
                                <span>Precio Venta</span>
                              </div>
                                <p className="text-lg font-black text-[#F0B429]">${dynamicPrice.toFixed(2)}</p>
                              </div>
                              <div className="p-3.5 bg-[#1C2333] rounded-xl border border-[#30363D]">
                                <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#8B949E]">
                                  <Activity size={14} className="text-[#388BFD]" />
                                  <span>Margen</span>
                                </div>
                                  <p className={`text-lg font-black ${margin >= 45 ? "text-[#3FB950]" : margin >= 25 ? "text-[#F0B429]" : "text-[#FF7B54]"}`}>
                                    {margin}%
                                  </p>
                                </div>
                                <div className="p-3.5 bg-[#1C2333] rounded-xl border border-[#30363D]">
                                  <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#8B949E]">
                                    <Package size={14} className="text-[#8B949E]" />
                                    <span>Costo</span>
                                  </div>
                                    <p className="text-lg font-bold text-[#E6EDF3]">${cost.toFixed(2)}</p>
                                  </div>
                                  <div className="p-3.5 bg-[#1C2333] rounded-xl border border-[#30363D]">
                                    <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#8B949E]">
                                      <Clock size={14} className="text-[#8B949E]" />
                                      <span>Preparación</span>
                                    </div>
                                    <p className="text-lg font-bold text-[#E6EDF3]">{product.preparationTime || 5} min</p>
                                  </div>
                                </div>

                                      {/* Ingredients Section */}
                                      {recipe && ingredients.length > 0 && (
                                        <div className="space-y-3 bg-[#1C2333] p-4 rounded-xl border border-[#30363D]">
                                          <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
                                            <div className="flex items-center gap-2 text-xs font-bold text-[#F0B429] uppercase tracking-wider">
                                              <Beaker size={15} />
                                              <span>Mapeo de Ingredientes</span>
                                            </div>
                                                <span className="text-xs text-[#8B949E] font-semibold">{ingredients.length} ingredientes</span>
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
                                                        className="flex items-center justify-between bg-[#161B22] p-2.5 rounded-lg border border-[#30363D]"
                                                      >
                                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                          <div className={`p-1.5 rounded-md ${isAvailable ? "bg-[rgba(63,185,80,0.15)] text-[#3FB950]" : "bg-[rgba(248,81,73,0.15)] text-[#F85149]"}`}>
                                                            {isAvailable ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                                                          </div>
                                                              <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-[#E6EDF3] truncate">
                                                                  {inventoryItem?.name || "Ítem desconocido"}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8B949E]">
                                                                  <span>Requerido: {requiredQuantity} {ingredient.unit}</span>
                                                                  <span>·</span>
                                                                  <span className={isAvailable ? "text-[#3FB950]" : "text-[#F85149]"}>
                                                                    Disponible: {availableStock} {inventoryItem?.unit || ingredient.unit}
                                                                  </span>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                                                            <span className="text-xs font-bold text-[#8B949E]">{stockPercent.toFixed(0)}%</span>
                                                            <div className="w-14 h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                                                              <div
                                                                className={`h-full ${isAvailable ? "bg-[#3FB950]" : "bg-[#F85149]"}`}
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

                                                          {/* Menus Section */}
                                                          {menuIds && menuIds.length > 0 && (
                                                            <div className="space-y-2.5 bg-[#1C2333] p-4 rounded-xl border border-[#30363D]">
                                                              <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
                                                                <div className="flex items-center gap-2 text-xs font-bold text-[#388BFD] uppercase tracking-wider">
                                                                  <Layers size={15} />
                                                                  <span>Menús Asociados</span>
                                                                </div>
                                                                <span className="text-xs text-[#8B949E]">{menuIds.length} menús</span>
                                                              </div>
              <div className="flex flex-wrap gap-2">
                {menuIds.map((menuId: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1.5 bg-[#161B22] border border-[#30363D] rounded-lg flex items-center gap-1.5 text-xs font-medium text-[#E6EDF3]"
                  >
                    <Layers size={12} className="text-[#388BFD]" />
                    <span>Menú #{menuId.slice(0, 8)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description & Tags */}
          <div className="bg-[#1C2333] p-4 rounded-xl border border-[#30363D] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8B949E] uppercase tracking-wider pb-2 border-b border-[#30363D]">
              <Tag size={14} />
              <span>Información Comercial</span>
            </div>
            {product.description ? (
              <p className="text-xs text-[#8B949E] leading-relaxed">{product.description}</p>
            ) : (
              <p className="text-xs text-[#8B949E]/50 italic">Sin descripción registrada</p>
            )}

            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-[#21283A] text-[#8B949E] rounded-md border border-[#30363D]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

                                                          {/* Footer Actions */}
                                                          <div className="p-4 border-t border-[#30363D] shrink-0 flex gap-2.5 bg-[#1C2333]">
                                                            {onEdit && (
                                                              <button
                                                                onClick={() => { onEdit(product); closeDrawer(); }}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[rgba(240,180,41,0.15)] border border-[rgba(240,180,41,0.30)] text-[#F0B429] hover:bg-[rgba(240,180,41,0.25)] rounded-lg transition-colors font-bold text-xs uppercase tracking-wider"
                                                              >
                                                                <Pencil size={14} />
                                                                <span>Editar</span>
                                                              </button>
                                                            )}
                                                            {onDelete && (
                                                              <button
                                                                onClick={() => { if (confirm("¿Eliminar este producto?")) { onDelete(product._id!); closeDrawer(); } }}
                                                                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[rgba(248,81,73,0.12)] border border-[rgba(248,81,73,0.30)] text-[#F85149] hover:bg-[rgba(248,81,73,0.22)] rounded-lg transition-colors font-bold text-xs uppercase tracking-wider"
                                                              >
                                                                <Trash2 size={14} />
                                                                <span>Eliminar</span>
                                                              </button>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </>
                                                    );
}
