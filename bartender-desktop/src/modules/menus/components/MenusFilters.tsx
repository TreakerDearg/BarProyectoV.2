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
    <div className="p-4 bg-[#161B22] border border-[#30363D] rounded-xl space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
        <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Filtros de Catálogo</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-[#F85149] hover:underline transition-colors"
          >
            <X size={13} />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5 block">Tipo de Carta</label>
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#1C2333] border border-[#30363D] rounded-lg text-[#E6EDF3] text-xs focus:outline-none focus:border-[#F0B429] transition-colors"
          >
            <option value="all">Todas las categorías</option>
            <option value="drink">Mixología / Bebidas</option>
            <option value="food">Gastronomía / Platos</option>
            <option value="mixed">Mixtas (Bebidas + Comida)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5 block">Estado en Salón</label>
          <select
            value={filterActive}
            onChange={(e) => onFilterActiveChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#1C2333] border border-[#30363D] rounded-lg text-[#E6EDF3] text-xs focus:outline-none focus:border-[#F0B429] transition-colors"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas (Visibles para clientes)</option>
            <option value="inactive">Inactivas (Ocultas)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5 block">Visibilidad Web</label>
          <select
            value={filterPublic}
            onChange={(e) => onFilterPublicChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#1C2333] border border-[#30363D] rounded-lg text-[#E6EDF3] text-xs focus:outline-none focus:border-[#F0B429] transition-colors"
          >
            <option value="all">Todas las visibilidades</option>
            <option value="public">Pública (Acceso por QR libre)</option>
            <option value="private">Privada (Sólo personal)</option>
          </select>
        </div>

        <div className="flex items-center pt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFeatured}
              onChange={(e) => onFilterFeaturedChange(e.target.checked)}
              className="w-4 h-4 rounded border-[#30363D] bg-[#1C2333] accent-[#F0B429] cursor-pointer"
            />
            <span className="text-xs font-semibold text-[#E6EDF3]">Solo cartas destacadas</span>
          </label>
        </div>
      </div>
    </div>
  );
}
