"use client";

import { Eye, Smartphone, Monitor, Share2, Download, CheckCircle, AlertTriangle } from "lucide-react";
import type { Menu } from "../../../types/menu";
import { getProductDisplayName } from "../utils/menuUtils";

interface Props {
  menu: Menu;
}

export default function MenuPreview({ menu }: Props) {
  const totalProducts = menu.categories?.reduce((sum, cat) => sum + cat.products.length, 0) || 0;
  const availableProducts = menu.categories?.reduce(
    (sum, cat) => sum + cat.products.filter(p => p.available).length,
    0
  ) || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-rose-400" />
          <h3 className="text-sm font-black text-ivory uppercase tracking-widest">Vista Previa</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-ivory hover:bg-white/10 transition-all">
            <Smartphone size={12} />
          </button>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-ivory hover:bg-white/10 transition-all">
            <Monitor size={12} />
          </button>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-ivory hover:bg-white/10 transition-all">
            <Share2 size={12} />
          </button>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-ivory hover:bg-white/10 transition-all">
            <Download size={12} />
          </button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-surface-3 rounded-2xl border border-white/5 overflow-hidden">
        {/* Menu Header */}
        <div className="relative p-6 bg-gradient-to-br from-rose/20 to-violet/20">
          {menu.image && (
            <div className="absolute inset-0">
              <img src={menu.image} alt={menu.name} className="w-full h-full object-cover opacity-20" />
            </div>
          )}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              {menu.active && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald/10 border border-emerald/30">
                  <CheckCircle size={10} className="text-emerald-400" />
                  <span className="text-[8px] font-semibold text-emerald-300 uppercase tracking-wider">Activo</span>
                </div>
              )}
              {menu.isPublic && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 border border-gold/30">
                  <Share2 size={10} className="text-gold-400" />
                  <span className="text-[8px] font-semibold text-gold-300 uppercase tracking-wider">Público</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-black text-ivory tracking-tight uppercase">{menu.name}</h2>
            {menu.description && (
              <p className="text-sm text-muted/80 mt-2">{menu.description}</p>
            )}
          </div>
        </div>

        {/* Categories Preview */}
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {menu.categories?.map((category, idx) => {
            const catAvailable = category.products.filter(p => p.available).length;
            const catTotal = category.products.length;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-ivory uppercase tracking-wider">
                    {category.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    {catAvailable === catTotal ? (
                      <CheckCircle size={10} className="text-emerald-400" />
                    ) : (
                      <AlertTriangle size={10} className="text-red-400" />
                    )}
                    <span className="text-[10px] text-muted">
                      {catAvailable}/{catTotal}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {category.products.slice(0, 3).map((product, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-[10px] text-muted truncate flex-1">
                        {getProductDisplayName(product.product)}
                      </span>
                      <span className="text-[10px] font-semibold text-gold">
                        ${product.price?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  ))}
                  {category.products.length > 3 && (
                    <div className="text-[10px] text-muted/50 text-center py-1">
                      +{category.products.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted font-semibold">
              {menu.categories?.length || 0} categorías · {totalProducts} productos
            </span>
            <span className="text-[10px] font-semibold text-emerald-400">
              {availableProducts} disponibles
            </span>
          </div>
        </div>
      </div>

      {/* Preview Actions */}
      <div className="flex gap-2">
        <button className="flex-1 py-3 rounded-xl bg-rose/10 border border-rose/30 text-rose-300 text-[10px] font-black uppercase tracking-widest hover:bg-rose/20 transition-all">
          Ver en Vivo
        </button>
        <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-muted text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          Generar QR
        </button>
      </div>
    </div>
  );
}
