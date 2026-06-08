"use client";

import { useState } from "react";
import { Search, Filter, Grid, List } from "lucide-react";
import MenuCardPublic from "../MenuCardPublic";
import type { MenuPublic, MenuFilter } from "../../../../types/menu";

interface Props {
  menus: MenuPublic[];
  onViewDetails: (menu: MenuPublic) => void;
  loading?: boolean;
}

export default function PublicMenuGrid({ menus, onViewDetails, loading = false }: Props) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<MenuFilter>({});

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = searchQuery === "" ||
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (menu.description && menu.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = !filters.type || menu.type === filters.type;
    const matchesFeatured = !filters.featured || menu.featured;

    return matchesSearch && matchesType && matchesFeatured;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar menús..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-3 border border-white/10 rounded-xl text-ivory placeholder:text-muted focus:outline-none focus:border-gold/30 transition-colors"
          />
        </div>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`p-2 rounded-xl border transition-colors ${filterOpen ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-surface-3 border-white/10 text-muted hover:text-ivory'}`}
        >
          <Filter size={16} />
        </button>
        <div className="flex bg-surface-3 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? 'bg-gold/10 text-gold' : 'text-muted hover:text-ivory'}`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? 'bg-gold/10 text-gold' : 'text-muted hover:text-ivory'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="p-4 bg-surface-3 border border-white/10 rounded-xl space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Tipo</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, type: undefined })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!filters.type ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-muted hover:text-ivory'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilters({ ...filters, type: "drink" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filters.type === "drink" ? 'bg-cyan/10 border-cyan/30 text-cyan' : 'bg-white/5 border-white/10 text-muted hover:text-ivory'}`}
              >
                Bebidas
              </button>
              <button
                onClick={() => setFilters({ ...filters, type: "food" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filters.type === "food" ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-muted hover:text-ivory'}`}
              >
                Comida
              </button>
              <button
                onClick={() => setFilters({ ...filters, type: "mixed" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filters.type === "mixed" ? 'bg-violet/10 border-violet/30 text-violet' : 'bg-white/5 border-white/10 text-muted hover:text-ivory'}`}
              >
                Mixto
              </button>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-surface-2 text-gold focus:ring-gold/50"
              />
              <span className="text-xs font-semibold text-muted">Solo destacados</span>
            </label>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {filteredMenus.length} menú{filteredMenus.length !== 1 ? 's' : ''} encontrado{filteredMenus.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMenus.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">No se encontraron menús</p>
        </div>
      )}

      {/* Menu Grid */}
      {!loading && filteredMenus.length > 0 && (
        <div className={`
          grid gap-6
          ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}
        `}>
          {filteredMenus.map((menu) => (
            <MenuCardPublic
              key={menu._id}
              menu={menu}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
