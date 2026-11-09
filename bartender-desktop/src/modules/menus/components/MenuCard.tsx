"use client";

import {
  Pencil,
  Trash2,
  ChevronRight,
  Box,
  Target,
  Copy,
  CheckCircle,
  XCircle,
  FileText,
  Martini,
  Utensils,
  Layers,
  Star,
  Eye,
  Image as ImageIcon,
  Loader2,
  Share2,
  QrCode,
} from "lucide-react";

import { useState, memo } from "react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (menu: Menu) => void;
  onExport?: (menu: Menu) => void;
  simplified?: boolean;
}

function MenuCard({ menu, onEdit, onDelete, onDuplicate, onExport, simplified = false }: Props) {
  const totalProducts = menu.categories?.reduce((acc, cat) => acc + (cat.products?.length || 0), 0) || 0;
  const totalCategories = menu.categories?.length || 0;
  const isActive = menu.active;
  const isPublic = menu.isPublic;

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError]     = useState(false);

  // Products with recipe attached
  const productsWithRecipes = menu.categories?.reduce((acc, cat) => {
    return acc + (cat.products?.filter(p => p.hasRecipe).length || 0);
  }, 0) || 0;

  const getTypeTheme = () => {
    switch (menu.type) {
      case 'drink':
        return { label: "Mixología", icon: <Martini size={13} />, badge: "bg-[rgba(240,180,41,0.12)] border-[rgba(240,180,41,0.30)] text-[#F0B429]" };
      case 'food':
        return { label: "Gastronomía", icon: <Utensils size={13} />, badge: "bg-[rgba(63,185,80,0.12)] border-[rgba(63,185,80,0.30)] text-[#3FB950]" };
      case 'mixed':
      default:
        return { label: "Mixta", icon: <Layers size={13} />, badge: "bg-[rgba(56,139,253,0.12)] border-[rgba(56,139,253,0.30)] text-[#388BFD]" };
    }
  };

  const typeTheme = getTypeTheme();
  const currentImage = menu.image;

  return (
    <div
      onClick={() => onEdit(menu)}
      className="group relative rounded-xl border border-[#30363D] bg-[#161B22] hover:border-[#3D444D] overflow-hidden transition-all duration-200 flex flex-col shadow-sm cursor-pointer"
    >
      {/* ── Banner de Portada (Aspect Ratio 16:10) ────────────────── */}
      <div className="relative aspect-[16/10] bg-[#090E14] overflow-hidden shrink-0 border-b border-[#30363D]">
        {currentImage && !imageError ? (
          <>
            <img
              src={currentImage}
              alt={menu.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#161B22]">
                <Loader2 size={24} className="text-[#F0B429] animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#161B22] via-[#161B22]/30 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-[#1C2333] flex items-center justify-center">
            <ImageIcon size={36} className="text-[#8B949E]/40" />
          </div>
        )}

        {/* Badges superiores sobre la imagen */}
        <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold uppercase tracking-wider backdrop-blur-md ${typeTheme.badge}`}>
              {typeTheme.icon}
              <span>{typeTheme.label}</span>
            </span>
            {isPublic && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold bg-[#161B22]/90 border-[#30363D] text-[#8B949E]">
                <Share2 size={11} />
                <span>Pública</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {menu.featured && (
              <div className="p-1 rounded-md bg-[#161B22]/90 border border-[rgba(240,180,41,0.40)]">
                <Star size={13} className="text-[#F0B429] fill-[#F0B429]" />
              </div>
            )}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold backdrop-blur-md ${
              isActive
                ? "bg-[rgba(63,185,80,0.15)] border-[rgba(63,185,80,0.30)] text-[#3FB950]"
                : "bg-[rgba(248,81,73,0.15)] border-[rgba(248,81,73,0.30)] text-[#F85149]"
            }`}>
              {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
              <span>{isActive ? "Activa" : "Pausada"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido de la Carta ─────────────────────────────────── */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <h3 className="font-bold text-base text-[#E6EDF3] tracking-tight group-hover:text-[#F0B429] transition-colors truncate">
            {menu.name}
          </h3>
          <p className="text-xs text-[#8B949E] mt-1 line-clamp-2 leading-relaxed">
            {menu.description || "Carta para servicio en mesa y barra."}
          </p>

          {/* Chips de categorías incluidas */}
          {menu.categories && menu.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {menu.categories.slice(0, 4).map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#1C2333] border border-[#30363D] text-xs font-medium text-[#8B949E]"
                >
                  {cat.name} ({cat.products?.length || 0})
                </span>
              ))}
              {menu.categories.length > 4 && (
                <span className="text-xs text-[#8B949E]/60 self-center">
                  +{menu.categories.length - 4} más
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Métricas Clave de la Carta ─────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#30363D]/60">
          <div className="bg-[#1C2333] p-2 rounded-lg border border-[#30363D] text-center">
            <span className="text-xs font-semibold text-[#8B949E] uppercase block mb-0.5">Productos</span>
            <span className="text-xs font-black text-[#E6EDF3] flex items-center justify-center gap-1">
              <Box size={13} className="text-[#3FB950]" />
              {totalProducts}
            </span>
          </div>

          <div className="bg-[#1C2333] p-2 rounded-lg border border-[#30363D] text-center">
            <span className="text-xs font-semibold text-[#8B949E] uppercase block mb-0.5">Categorías</span>
            <span className="text-xs font-black text-[#E6EDF3] flex items-center justify-center gap-1">
              <Target size={13} className="text-[#F0B429]" />
              {totalCategories}
            </span>
          </div>

          <div className="bg-[#1C2333] p-2 rounded-lg border border-[#30363D] text-center">
            <span className="text-xs font-semibold text-[#8B949E] uppercase block mb-0.5">Recetas</span>
            <span className="text-xs font-black text-[#E6EDF3] flex items-center justify-center gap-1">
              <FileText size={13} className="text-[#388BFD]" />
              {productsWithRecipes}
            </span>
          </div>
        </div>

        {/* ── Acciones de la Tarjeta ─────────────────────────────── */}
        <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(menu)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[rgba(240,180,41,0.12)] hover:bg-[rgba(240,180,41,0.22)] border border-[rgba(240,180,41,0.30)] text-[#F0B429] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Pencil size={13} />
            <span>Diseñar Carta</span>
          </button>

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(menu)}
              className="p-2 rounded-lg bg-[#1C2333] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
              title="Duplicar carta"
            >
              <Copy size={14} />
            </button>
          )}

          <button
            onClick={() => onDelete(menu._id!)}
            className="p-2 rounded-lg bg-[rgba(248,81,73,0.10)] border border-[rgba(248,81,73,0.25)] text-[#F85149] hover:bg-[rgba(248,81,73,0.20)] transition-colors"
            title="Eliminar carta"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(MenuCard);
