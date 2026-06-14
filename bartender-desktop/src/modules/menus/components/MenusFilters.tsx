"use client";

import { X } from "lucide-react";

interface Props {
  filterType: "all" | "drink" | "food" | "mixed";
  onFilterTypeChange: (value: "all" | "drink" | "food" | "mixed") => void;
  filterActive: "all" | "active" | "inactive";
  onFilterActiveChange: (value: "all" | "active" | "inactive") => void;
  filterPublic: "all" | "public" | "private";
  onFilterPublicChange: (value: "all" | "public" | "private") => void;
  filterFeatured: boolean;
  onFilterFeaturedChange: (value: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function MenusFilters({
  filterType,
  onFilterTypeChange,
  filterActive,
  onFilterActiveChange,
  filterPublic,
  onFilterPublicChange,
  filterFeatured,
  onFilterFeaturedChange,
  onClearFilters,
  hasActiveFilters,
}: Props) {
  return (
    <div className="p-4 bg-surface-3 border border-white/10 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Filtros Avanzados</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red/10 border border-red/30 text-red-300 text-xs font-semibold hover:bg-red/20 transition-all"
          >
            <X size={12} />
            Limpiar
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 block">Tipo</label>
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-surface-2 border border-white/10 rounded-lg text-ivory text-xs focus:outline-none focus:border-gold/30 transition-colors"
          >
            <option value="all">Todos</option>
            <option value="drink">Bebidas</option>
            <option value="food">Comida</option>
            <option value="mixed">Mixto</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 block">Estado</label>
          <select
            value={filterActive}
            onChange={(e) => onFilterActiveChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-surface-2 border border-white/10 rounded-lg text-ivory text-xs focus:outline-none focus:border-gold/30 transition-colors"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 block">Visibilidad</label>
          <select
            value={filterPublic}
            onChange={(e) => onFilterPublicChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-surface-2 border border-white/10 rounded-lg text-ivory text-xs focus:outline-none focus:border-gold/30 transition-colors"
          >
            <option value="all">Todos</option>
            <option value="public">Públicos</option>
            <option value="private">Privados</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFeatured}
              onChange={(e) => onFilterFeaturedChange(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-surface-2 text-gold focus:ring-gold/50"
            />
            <span className="text-xs font-semibold text-muted">Solo destacados</span>
          </label>
        </div>
      </div>
    </div>
  );
}
