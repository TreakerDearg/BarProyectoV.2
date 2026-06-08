"use client";

import { useState } from "react";
import { Eye, Smartphone, Monitor, RefreshCw } from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
}

export default function MenuRealtimePreview({ menu }: Props) {
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");

  return (
    <div className="nebula-panel p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl">
            <Eye className="text-cyan-300" size={20} />
          </div>
          <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Vista Previa</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("mobile")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "mobile"
                ? "bg-cyan/10 border-cyan/30 text-cyan-300"
                : "bg-white/5 border-white/10 text-muted hover:border-white/20"
            }`}
          >
            <Smartphone size={16} />
          </button>
          <button
            onClick={() => setViewMode("desktop")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "desktop"
                ? "bg-cyan/10 border-cyan/30 text-cyan-300"
                : "bg-white/5 border-white/10 text-muted hover:border-white/20"
            }`}
          >
            <Monitor size={16} />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className={`bg-surface-2 rounded-xl border border-white/10 overflow-hidden ${
        viewMode === "mobile" ? "max-w-sm mx-auto" : "w-full"
      }`}>
        {/* Menu Header */}
        {menu.image && (
          <div className="relative h-32 bg-surface-3">
            <img
              src={menu.image}
              alt={menu.name}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-2xl font-black text-ivory uppercase tracking-wider text-center px-4">
                {menu.name}
              </h2>
            </div>
          </div>
        )}

        {!menu.image && (
          <div className="p-6 text-center border-b border-white/10">
            <h2 className="text-xl font-black text-ivory uppercase tracking-wider">
              {menu.name}
            </h2>
            {menu.description && (
              <p className="text-sm text-muted mt-2">{menu.description}</p>
            )}
          </div>
        )}

        {/* Menu Categories */}
        <div className="p-4 space-y-4">
          {menu.categories?.map((category) => (
            <div key={category.name}>
              <h3 className="text-sm font-bold text-ivory uppercase tracking-widest mb-3 border-b border-white/10 pb-2">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.products?.map((product) => (
                  <div
                    key={product.product}
                    className="flex items-center justify-between p-2 bg-surface-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-ivory">
                        Producto ID: {product.product}
                      </p>
                      {product.price && (
                        <p className="text-[10px] text-gold">${(product.price ?? 0).toFixed(2)}</p>
                      )}
                    </div>
                    {product.available === false && (
                      <span className="text-[8px] px-2 py-0.5 bg-red/10 text-red-400 rounded">
                        No disponible
                      </span>
                    )}
                  </div>
                ))}
                {(!category.products || category.products.length === 0) && (
                  <p className="text-[10px] text-muted italic">Sin productos</p>
                )}
              </div>
            </div>
          ))}
          {(!menu.categories || menu.categories.length === 0) && (
            <div className="text-center py-8 text-muted text-sm">
              Esta carta no tiene categorías aún
            </div>
          )}
        </div>

        {/* Menu Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-muted">
            {menu.active ? "Activo" : "Inactivo"} · {menu.type?.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Refresh Button */}
      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-muted hover:bg-white/10 transition-all">
        <RefreshCw size={14} />
        <span className="text-xs font-semibold">Actualizar vista previa</span>
      </button>
    </div>
  );
}
