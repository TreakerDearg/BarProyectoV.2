"use client";

import { useState } from "react";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  SlidersHorizontal,
  Save,
  RotateCcw,
  Check
} from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "range";
  options: FilterOption[];
  selected: string[];
  min?: number;
  max?: number;
}

interface Props {
  onSearch: (query: string) => void;
  onFilterChange: (filters: Record<string, string[]>) => void;
  filterGroups: FilterGroup[];
  savedFilters?: { name: string; filters: Record<string, string[]> }[];
  onSaveFilter?: (name: string, filters: Record<string, string[]>) => void;
  onLoadFilter?: (filters: Record<string, string[]>) => void;
  placeholder?: string;
}

export default function AdvancedSearchFilter({
  onSearch,
  onFilterChange,
  filterGroups,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  placeholder = "Buscar...",
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleFilter = (groupId: string, value: string) => {
    const group = filterGroups.find(g => g.id === groupId);
    if (!group) return;

    let newSelected: string[];
    
    if (group.type === "radio") {
      // For radio, only one selection allowed
      newSelected = activeFilters[groupId]?.includes(value) ? [] : [value];
    } else {
      // For checkbox, toggle selection
      const current = activeFilters[groupId] || [];
      newSelected = current.includes(value) 
        ? current.filter(v => v !== value)
        : [...current, value];
    }

    setActiveFilters(prev => ({ ...prev, [groupId]: newSelected }));
    onFilterChange({ ...activeFilters, [groupId]: newSelected });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilterChange({});
    setSearchQuery("");
    onSearch("");
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);
  };

  const hasActiveFilters = getActiveFilterCount() > 0 || searchQuery.length > 0;

  return (
    <div className="bg-surface-3/30 border border-white/5 rounded-[2rem] p-6 space-y-4 backdrop-blur-md">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-surface-4/40 border border-white/5 rounded-2xl text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ivory transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold/80 transition-colors"
        >
          <SlidersHorizontal size={16} />
          <span>Filtros Avanzados</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-gold/20 text-gold rounded-full text-xs font-bold">
              {getActiveFilterCount() + (searchQuery.length > 0 ? 1 : 0)}
            </span>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="flex items-center gap-2">
          {savedFilters.length > 0 && (
            <button
              onClick={() => setShowSavedFilters(!showSavedFilters)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ivory transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
            >
              <Save size={12} />
              <span>Guardados</span>
            </button>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg bg-red/5 hover:bg-red/10"
            >
              <RotateCcw size={12} />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Saved Filters Dropdown */}
      {showSavedFilters && savedFilters.length > 0 && (
        <div className="bg-surface-4/40 border border-white/5 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Filtros Guardados</p>
          {savedFilters.map((saved, idx) => (
            <button
              key={idx}
              onClick={() => {
                onLoadFilter?.(saved.filters);
                setActiveFilters(saved.filters);
                setShowSavedFilters(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
            >
              <span className="text-sm font-semibold text-ivory">{saved.name}</span>
              <ChevronRight size={14} className="text-muted group-hover:text-gold transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Expanded Filter Groups */}
      {isExpanded && (
        <div className="space-y-6 pt-4 border-t border-white/5">
          {filterGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted uppercase tracking-widest">{group.label}</p>
                {(activeFilters[group.id] || []).length > 0 && (
                  <button
                    onClick={() => toggleFilter(group.id, "")}
                    className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isSelected = (activeFilters[group.id] || []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleFilter(group.id, option.value)}
                      className={`
                        px-4 py-2 rounded-xl border transition-all text-sm font-semibold
                        ${isSelected
                          ? 'bg-gold/20 border-gold/30 text-gold'
                          : 'bg-white/5 border-white/10 text-muted hover:border-white/20 hover:bg-white/10'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        {option.label}
                        {option.count !== undefined && (
                          <span className={`text-xs ${isSelected ? 'text-gold/70' : 'text-muted/50'}`}>
                            ({option.count})
                          </span>
                        )}
                        {isSelected && <Check size={12} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Save Current Filter */}
          {hasActiveFilters && onSaveFilter && (
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  const name = prompt("Nombre para guardar este filtro:");
                  if (name) {
                    onSaveFilter(name, activeFilters);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-violet/10 border border-violet/20 rounded-2xl text-violet-400 hover:bg-violet/20 hover:border-violet/30 transition-all font-semibold text-sm"
              >
                <Save size={16} />
                <span>Guardar Filtro Actual</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
