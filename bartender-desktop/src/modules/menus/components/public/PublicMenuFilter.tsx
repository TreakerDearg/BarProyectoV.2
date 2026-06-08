"use client";

import { X, ChevronDown } from "lucide-react";
import type { MenuFilter } from "../../../../types/menu";

interface Props {
  filters: MenuFilter;
  onFiltersChange: (filters: MenuFilter) => void;
  onClear: () => void;
}

export default function PublicMenuFilter({ filters, onFiltersChange, onClear }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = filters.type || filters.featured || filters.tags?.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-surface-3 border border-white/10 rounded-xl text-sm font-semibold text-ivory hover:border-white/20 transition-colors"
      >
        <Filter size={16} />
        <span>Filtros</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-gold" />
        )}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-surface-3 border border-white/10 rounded-xl shadow-xl z-20 space-y-4">
            {/* Type Filter */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Tipo</label>
              <div className="space-y-1">
                <button
                  onClick={() => onFiltersChange({ ...filters, type: undefined })}
                  className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors ${!filters.type ? 'bg-gold/10 text-gold' : 'bg-white/5 text-muted hover:text-ivory'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => onFiltersChange({ ...filters, type: "drink" })}
                  className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors ${filters.type === "drink" ? 'bg-cyan/10 text-cyan' : 'bg-white/5 text-muted hover:text-ivory'}`}
                >
                  Bebidas
                </button>
                <button
                  onClick={() => onFiltersChange({ ...filters, type: "food" })}
                  className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors ${filters.type === "food" ? 'bg-gold/10 text-gold' : 'bg-white/5 text-muted hover:text-ivory'}`}
                >
                  Comida
                </button>
                <button
                  onClick={() => onFiltersChange({ ...filters, type: "mixed" })}
                  className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors ${filters.type === "mixed" ? 'bg-violet/10 text-violet' : 'bg-white/5 text-muted hover:text-ivory'}`}
                >
                  Mixto
                </button>
              </div>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => onFiltersChange({ ...filters, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-surface-2 text-gold focus:ring-gold/50"
                />
                <span className="text-xs font-semibold text-muted">Solo destacados</span>
              </label>
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red/10 border border-red/30 rounded-lg text-xs font-semibold text-red-300 hover:bg-red/20 transition-colors"
              >
                <X size={12} />
                Limpiar filtros
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
