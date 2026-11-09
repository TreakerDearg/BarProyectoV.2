"use client";

import { useState } from "react";
import { Eye, Smartphone, Monitor, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import type { Menu } from "../../../types/menu";
import { getProductDisplayName } from "../utils/menuUtils";

interface Props {
  menu: Menu;
}

export default function MenuRealtimePreview({ menu }: Props) {
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const [refreshKey, setRefreshKey] = useState(0);

  const totalProducts = menu.categories?.reduce((sum, cat) => sum + cat.products.length, 0) || 0;
  const availableProducts = menu.categories?.reduce(
    (sum, cat) => sum + cat.products.filter(p => p.available).length,
    0
  ) || 0;

  return (
    <div key={refreshKey} className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-5 shadow-sm">
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-[#30363D]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[rgba(240,180,41,0.12)] text-[#F0B429] rounded-xl">
            <Eye size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
              Vista Previa en Tiempo Real
            </h3>
            <p className="text-xs text-[#8B949E]">
              Simulación de cómo visualizarán tus clientes esta carta digital
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0D1117] p-1 rounded-xl border border-[#30363D]">
            <button
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "mobile"
                  ? "bg-[#21283A] text-[#F0B429] border border-[#F0B429]/40"
                  : "text-[#8B949E] hover:text-[#E6EDF3]"
              }`}
            >
              <Smartphone size={14} />
              <span>Móvil</span>
            </button>
            <button
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "desktop"
                  ? "bg-[#21283A] text-[#F0B429] border border-[#F0B429]/40"
                  : "text-[#8B949E] hover:text-[#E6EDF3]"
              }`}
            >
              <Monitor size={14} />
              <span>Escritorio</span>
            </button>
          </div>

          <button
            onClick={() => setRefreshKey(k => k + 1)}
            title="Refrescar vista"
            className="p-2 rounded-xl bg-[#0D1117] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#8B949E] transition-all"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex justify-center">
        <div
          className={`rounded-2xl border-2 border-[#30363D] bg-[#0D1117] overflow-hidden shadow-2xl transition-all ${
            viewMode === "mobile" ? "w-full max-w-sm" : "w-full"
          }`}
        >
          {/* Header Image or Minimal Banner */}
          {menu.image ? (
            <div className="relative h-44 bg-[#1C2333]">
              <img
                src={menu.image}
                alt={menu.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-black/40 flex flex-col justify-end p-5">
                <span className="text-xs font-bold uppercase tracking-widest text-[#F0B429] mb-1">
                  {menu.type === "drink" ? "Carta de Bebidas" : menu.type === "food" ? "Carta Gastronómica" : "Carta Mixta"}
                </span>
                <h2 className="text-2xl font-black text-[#E6EDF3] uppercase tracking-tight">
                  {menu.name || "Sin Nombre"}
                </h2>
                {menu.description && (
                  <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">
                    {menu.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border-b border-[#30363D] bg-[#161B22]">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F0B429] mb-1 block">
                {menu.type === "drink" ? "Carta de Bebidas" : menu.type === "food" ? "Carta Gastronómica" : "Carta Mixta"}
              </span>
              <h2 className="text-2xl font-black text-[#E6EDF3] uppercase tracking-tight">
                {menu.name || "Sin Nombre"}
              </h2>
              {menu.description && (
                <p className="text-xs text-[#8B949E] mt-2 max-w-md mx-auto">
                  {menu.description}
                </p>
              )}
            </div>
          )}

          {/* Categories List */}
          <div className="p-5 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
            {menu.categories && menu.categories.length > 0 ? (
              menu.categories.map((category) => (
                <div key={category.name} className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
                    <h3 className="text-xs font-bold text-[#F0B429] uppercase tracking-widest">
                      {category.name}
                    </h3>
                    <span className="text-xs text-[#8B949E]">
                      {category.products?.length || 0} ítems
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {category.products?.map((product, pIdx) => {
                      const isAvail = product.available !== false;
                      return (
                        <div
                          key={pIdx}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#161B22] border border-[#30363D] hover:border-[#3D444D] transition-all"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-xs font-semibold text-[#E6EDF3] truncate">
                              {getProductDisplayName(product.product)}
                            </p>
                            {!isAvail && (
                              <span className="inline-flex items-center gap-1 text-xs text-[#F85149] font-medium mt-0.5">
                                <AlertTriangle size={11} /> No disponible
                              </span>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs font-bold text-[#F0B429]">
                              ${(product.price ?? 0).toLocaleString("es-AR")}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {(!category.products || category.products.length === 0) && (
                      <p className="text-xs text-[#8B949E] italic py-2 text-center">
                        Sin productos en esta categoría
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#8B949E] space-y-2">
                <AlertTriangle size={32} className="mx-auto text-[#F0B429]/60" />
                <p className="text-xs font-semibold text-[#E6EDF3]">Esta carta no tiene categorías aún</p>
                <p className="text-xs text-[#8B949E]">Dirígete a la pestaña "Categorías" para estructurar tu menú</p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 bg-[#161B22] border-t border-[#30363D] flex items-center justify-between text-xs text-[#8B949E]">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${menu.active ? "bg-[#3FB950]" : "bg-[#F85149]"}`} />
              {menu.active ? "Carta Activa" : "Carta Inactiva"}
            </span>
            <span>
              {menu.categories?.length || 0} categorías · {totalProducts} productos ({availableProducts} disp.)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
