"use client";

import { useState } from "react";
import { Smartphone, Monitor, Eye, Layers, Target, FileText, Martini, Utensils, Star, CheckCircle, Clock } from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
}

export default function IdentityPreview({ menu }: Props) {
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");

  const totalProducts = menu.categories?.reduce((sum, cat) => sum + cat.products.length, 0) || 0;
  const totalCategories = menu.categories?.length || 0;

  const getTypeIcon = () => {
    switch (menu.type) {
      case 'drink':
        return <Martini size={12} className="text-cyan-400" />;
      case 'food':
        return <Utensils size={12} className="text-gold" />;
      case 'mixed':
      default:
        return <Layers size={12} className="text-violet-400" />;
    }
  };

  const MobilePreview = () => (
    <div className="w-[280px] h-[560px] bg-surface-2 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Mobile Header */}
      <div className="relative h-48 bg-gradient-to-br from-violet-600/20 to-cyan-600/20">
        {menu.image ? (
          <img
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers size={32} className="text-muted/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-2 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-violet/20">
              {getTypeIcon()}
            </div>
            {menu.active && (
              <CheckCircle size={12} className="text-emerald-400" />
            )}
            {menu.featured && (
              <Star size={12} className="text-gold-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-ivory leading-tight">{menu.name || "Sin nombre"}</h3>
          <p className="text-[10px] text-muted/80 line-clamp-2 mt-1">
            {menu.description || "Sin descripción"}
          </p>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-3">
        {/* Categories Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target size={10} className="text-rose-400" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
              Categorías ({totalCategories})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {menu.categories?.slice(0, 4).map((cat) => (
              <span key={cat.name} className="text-[9px] px-2 py-1 bg-violet/10 text-violet-300 rounded font-semibold">
                {cat.name}
              </span>
            ))}
            {totalCategories > 4 && (
              <span className="text-[9px] text-muted/50">+{totalCategories - 4}</span>
            )}
          </div>
        </div>

        {/* Products Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText size={10} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
              Productos ({totalProducts})
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (totalProducts / 20) * 100)}%` }}
            />
          </div>
        </div>

        {/* Last Updated */}
        {menu.updatedAt && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
            <Clock size={8} className="text-muted/50" />
            <span className="text-[8px] text-muted/50 font-semibold">
              Actualizado {new Date(menu.updatedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const DesktopPreview = () => (
    <div className="w-full max-w-md bg-surface-2 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      {/* Desktop Header */}
      <div className="relative h-32 bg-gradient-to-br from-violet-600/20 to-cyan-600/20">
        {menu.image ? (
          <img
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers size={32} className="text-muted/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-2 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet/20">
              {getTypeIcon()}
            </div>
            <h3 className="text-base font-bold text-ivory">{menu.name || "Sin nombre"}</h3>
          </div>
          <div className="flex items-center gap-1">
            {menu.active && (
              <CheckCircle size={10} className="text-emerald-400" />
            )}
            {menu.featured && (
              <Star size={10} className="text-gold-400" />
            )}
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted/80 line-clamp-2">
          {menu.description || "Sin descripción"}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Target size={10} className="text-rose-400" />
              <span className="text-[8px] font-semibold text-muted uppercase tracking-wider">Categorías</span>
            </div>
            <span className="text-sm font-bold text-ivory">{totalCategories}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText size={10} className="text-emerald-400" />
              <span className="text-[8px] font-semibold text-muted uppercase tracking-wider">Productos</span>
            </div>
            <span className="text-sm font-bold text-ivory">{totalProducts}</span>
          </div>
        </div>

        {menu.updatedAt && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
            <Clock size={8} className="text-muted/50" />
            <span className="text-[8px] text-muted/50 font-semibold">
              Actualizado {new Date(menu.updatedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-cyan-400" />
          <p className="text-xs font-semibold text-ivory uppercase tracking-wider">Preview</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode("mobile")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "mobile"
                ? "bg-violet/20 text-violet-300"
                : "text-muted/50 hover:text-muted"
            }`}
            title="Vista móvil"
          >
            <Smartphone size={14} />
          </button>
          <button
            onClick={() => setViewMode("desktop")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "desktop"
                ? "bg-violet/20 text-violet-300"
                : "text-muted/50 hover:text-muted"
            }`}
            title="Vista desktop"
          >
            <Monitor size={14} />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex items-center justify-center p-6 bg-surface-3/50 rounded-2xl border border-white/5">
        {viewMode === "mobile" ? <MobilePreview /> : <DesktopPreview />}
      </div>
    </div>
  );
}
