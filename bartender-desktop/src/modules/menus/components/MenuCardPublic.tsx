"use client";

import { Star, Eye, ChevronRight, Martini, Utensils, Layers } from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
  onViewDetails: (menu: Menu) => void;
}

export default function MenuCardPublic({ menu, onViewDetails }: Props) {
  const totalProducts = menu.categories?.reduce((acc, cat) => acc + (cat.products?.length || 0), 0) || 0;
  const totalCategories = menu.categories?.length || 0;
  const isPublic = menu.isPublic;
  const featured = menu.featured;

  // Get type icon
  const getTypeIcon = () => {
    switch (menu.type) {
      case 'drink':
        return <Martini size={14} className="text-cyan-400" />;
      case 'food':
        return <Utensils size={14} className="text-gold" />;
      case 'mixed':
      default:
        return <Layers size={14} className="text-violet-400" />;
    }
  };

  // Get type badge color
  const getTypeBadgeColor = () => {
    switch (menu.type) {
      case 'drink':
        return 'bg-cyan/10 border-cyan/30 text-cyan-300';
      case 'food':
        return 'bg-gold/10 border-gold/30 text-gold-300';
      case 'mixed':
      default:
        return 'bg-violet/10 border-violet/30 text-violet-300';
    }
  };

  return (
    <div
      onClick={() => onViewDetails(menu)}
      className={`
        relative group cursor-pointer
        rounded-2xl p-6 space-y-4
        border transition-all duration-300
        bg-surface-2 overflow-hidden
        hover:translate-y-[-4px] hover:shadow-lg
        ${featured ? 'border-gold/30 hover:border-gold/50' : 'border-white/5 hover:border-white/10'}
      `}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 border border-gold/30">
            <Star size={10} className="text-gold-400" />
            <span className="text-[8px] font-semibold text-gold-300 uppercase tracking-wider">Destacado</span>
          </div>
        </div>
      )}

      {/* Image */}
      {menu.image && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-surface-3">
          <img
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[8px] font-semibold uppercase tracking-wider ${getTypeBadgeColor()}`}>
            {getTypeIcon()}
            <span>{menu.type || 'mixed'}</span>
          </div>
          {isPublic && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan/10 border border-cyan/30">
              <Eye size={8} className="text-cyan-400" />
              <span className="text-[8px] font-semibold text-cyan-300 uppercase tracking-wider">Público</span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-black text-ivory tracking-tight uppercase">
          {menu.name}
        </h3>
        {menu.description && (
          <p className="text-sm text-muted/80 line-clamp-2">{menu.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Layers size={12} className="text-rose-400" />
          <span className="text-xs font-semibold text-muted">
            {totalCategories} categorías
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-muted">
            {totalProducts} productos
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        className="w-full py-3 rounded-xl bg-gold/10 border border-gold/30 text-gold-300 text-xs font-black uppercase tracking-widest hover:bg-gold/20 hover:border-gold/50 transition-all flex items-center justify-center gap-2"
      >
        Ver Menú
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
