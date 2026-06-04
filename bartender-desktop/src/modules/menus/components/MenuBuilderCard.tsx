"use client";

import { Layers, CheckCircle, Edit2, Trash2, Copy, FileText } from "lucide-react";
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
          <div className="flex items-center gap-2">
            {menu.active && (
              <div className="p-1 rounded-full bg-emerald/10">
                <CheckCircle size={10} className="text-emerald-400" />
              </div>
            )}
            <h3 className="text-sm font-black text-ivory tracking-tight uppercase truncate">
              {menu.name}
            </h3>
          </div>
          {menu.description && (
            <p className="text-[10px] text-muted/70 mt-1 line-clamp-2">{menu.description}</p>
          )}
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
      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Layers size={10} className="text-rose-400" />
          <span className="text-[10px] font-semibold text-muted">
            {totalCategories} categorías
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText size={10} className="text-violet-400" />
          <span className="text-[10px] font-semibold text-muted">
            {totalProducts} productos
          </span>
        </div>
        {recipesCount > 0 && (
          <div className="flex items-center gap-1.5">
            <FileText size={10} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-muted">
              {recipesCount} recetas
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
