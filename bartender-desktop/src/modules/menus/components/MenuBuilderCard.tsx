"use client";

import { useState } from "react";
import { Layers, CheckCircle, Edit2, Trash2, Copy, FileText, Martini, Utensils, Star, Eye, Image as ImageIcon, Loader2 } from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
  selected?: boolean;
  onSelect: (menu: Menu) => void;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (menu: Menu) => void;
  recipesCount?: number;
}

export default function MenuBuilderCard({
  menu,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  recipesCount = 0,
}: Props) {
  const totalProducts = menu.categories?.reduce((sum, cat) => sum + cat.products.length, 0) || 0;
  const totalCategories = menu.categories?.length || 0;
  const isPublic = menu.isPublic;
  const featured = menu.featured;

  // Image loading states
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Get type icon
  const getTypeIcon = () => {
    switch (menu.type) {
      case 'drink':
        return <Martini size={10} className="text-cyan-400" />;
      case 'food':
        return <Utensils size={10} className="text-gold" />;
      case 'mixed':
      default:
        return <Layers size={10} className="text-violet-400" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(menu)}
      className={`
        relative group cursor-pointer
        rounded-2xl p-4 space-y-3
        border transition-all duration-300
        ${selected
          ? 'bg-rose/10 border-rose/40 shadow-rose/20'
          : 'bg-surface-2 border-white/5 hover:border-rose/30 hover:translate-x-1'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {menu.image && !imageError ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-3 border border-white/5 flex-shrink-0 relative">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-3">
                    <Loader2 size={14} className="text-rose-400/50 animate-spin" />
                  </div>
                )}
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-surface-3 to-surface-2 border border-white/5 flex-shrink-0 flex items-center justify-center">
                <ImageIcon size={16} className="text-muted/40" />
              </div>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="text-sm font-black text-ivory tracking-tight uppercase truncate">
                {menu.name}
              </h3>
              <div className="flex items-center gap-1">
                {menu.active && (
                  <CheckCircle size={10} className="text-emerald-400 flex-shrink-0" />
                )}
                {isPublic && (
                  <Eye size={10} className="text-cyan-400 flex-shrink-0" />
                )}
                {featured && (
                  <Star size={10} className="text-gold-400 flex-shrink-0" />
                )}
                {menu.gallery && menu.gallery.length > 0 && (
                  <div className="flex items-center gap-0.5 bg-violet/10 px-1.5 py-0.5 rounded-full">
                    <ImageIcon size={8} className="text-violet-400" />
                    <span className="text-[8px] font-semibold text-violet-300">{menu.gallery.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-semibold uppercase tracking-wider">
              {getTypeIcon()}
              <span>{menu.type || 'mixed'}</span>
            </div>
            {menu.description && (
              <p className="text-[10px] text-muted/70 line-clamp-1">{menu.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(menu); }}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-ivory hover:bg-white/10 transition-all"
          >
            <Edit2 size={12} />
          </button>
          {onDuplicate && (
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(menu); }}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-ivory hover:bg-white/10 transition-all"
            >
              <Copy size={12} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(menu._id!); }}
            className="p-2 rounded-lg bg-red/5 border border-red/10 text-red/40 hover:text-red hover:bg-red/20 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Layers size={10} className="text-rose-400" />
          <span className="text-[10px] font-semibold text-muted">
            {totalCategories} cat
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText size={10} className="text-violet-400" />
          <span className="text-[10px] font-semibold text-muted">
            {totalProducts} prod
          </span>
        </div>
        {recipesCount > 0 && (
          <div className="flex items-center gap-1.5">
            <FileText size={10} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-muted">
              {recipesCount} rec
            </span>
          </div>
        )}
      </div>

      {/* Active indicator */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-400 rounded-l-2xl" />
      )}
    </div>
  );
}
