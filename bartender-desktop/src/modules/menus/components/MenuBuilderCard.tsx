"use client";

import { useState } from "react";
import {
  Layers,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Copy,
  FileText,
  Martini,
  Utensils,
  Star,
  Image as ImageIcon,
  Loader2,
  Box,
} from "lucide-react";
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

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError]     = useState(false);

  const getTypeIcon = () => {
    switch (menu.type) {
      case 'drink':
        return <Martini size={11} className="text-[#F0B429]" />;
      case 'food':
        return <Utensils size={11} className="text-[#3FB950]" />;
      case 'mixed':
      default:
        return <Layers size={11} className="text-[#388BFD]" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(menu)}
      className={`relative group cursor-pointer rounded-xl p-3 space-y-2.5 border transition-all duration-200 ${
        selected
          ? "bg-[#21283A] border-[#F0B429] shadow-sm ring-1 ring-[#F0B429]/30"
          : "bg-[#1C2333] border-[#30363D] hover:border-[#3D444D]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {menu.image && !imageError ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#090E14] border border-[#30363D] shrink-0 relative">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#161B22]">
                  <Loader2 size={13} className="text-[#F0B429] animate-spin" />
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
            <div className="w-10 h-10 rounded-lg bg-[#090E14] border border-[#30363D] shrink-0 flex items-center justify-center">
              <ImageIcon size={16} className="text-[#8B949E]/40" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-[#E6EDF3] truncate" title={menu.name}>
                {menu.name}
              </h4>
              {menu.active ? (
                <CheckCircle size={12} className="text-[#3FB950] shrink-0" title="Activa en salón" />
              ) : (
                <XCircle size={12} className="text-[#F85149] shrink-0" title="Inactiva" />
              )}
              {featured && (
                <Star size={11} className="text-[#F0B429] fill-[#F0B429] shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-[#8B949E] capitalize">
                {getTypeIcon()}
                <span>{menu.type || "mixta"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(menu)}
            className="p-1.5 rounded-md text-[#8B949E] hover:text-[#F0B429] hover:bg-[#161B22] transition-colors"
            title="Editar carta"
          >
            <Edit2 size={13} />
          </button>
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(menu)}
              className="p-1.5 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22] transition-colors"
              title="Duplicar carta"
            >
              <Copy size={13} />
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(`¿Eliminar carta "${menu.name}"?`)) onDelete(menu._id!);
            }}
            className="p-1.5 rounded-md text-[#8B949E] hover:text-[#F85149] hover:bg-[rgba(248,81,73,0.12)] transition-colors"
            title="Eliminar carta"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="flex items-center gap-3 pt-2 border-t border-[#30363D]/60 text-xs text-[#8B949E]">
        <div className="flex items-center gap-1">
          <Layers size={12} className="text-[#F0B429]" />
          <span>{totalCategories} cat</span>
        </div>
        <div className="flex items-center gap-1">
          <Box size={12} className="text-[#3FB950]" />
          <span>{totalProducts} prod</span>
        </div>
        {recipesCount > 0 && (
          <div className="flex items-center gap-1">
            <FileText size={12} className="text-[#388BFD]" />
            <span>{recipesCount} rec</span>
          </div>
        )}
      </div>
    </div>
  );
}
