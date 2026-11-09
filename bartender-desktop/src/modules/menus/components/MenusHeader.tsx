"use client";

import { Search, LayoutGrid, List, RefreshCcw, Plus, Filter, HelpCircle, Layers, X, Sparkles, SlidersHorizontal } from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  filtersOpen: boolean;
  onFiltersToggle: () => void;
  hasActiveFilters: boolean;
  mode: 'simple' | 'advanced';
  onModeChange: (mode: 'simple' | 'advanced') => void;
  builderMode: boolean;
  onBuilderModeToggle: () => void;
  view: 'grid' | 'list';
  onViewToggle: () => void;
  loading: boolean;
  onRefresh: () => void;
  onNewMenu: () => void;
  onOpenTutorial: () => void;
}

export default function MenusHeader({
  search,
  onSearchChange,
  filtersOpen,
  onFiltersToggle,
  hasActiveFilters,
  mode,
  onModeChange,
  builderMode,
  onBuilderModeToggle,
  view,
  onViewToggle,
  loading,
  onRefresh,
  onNewMenu,
  onOpenTutorial,
}: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] shrink-0">
      {/* Título y estado */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[rgba(240,180,41,0.12)] text-[#F0B429] border border-[rgba(240,180,41,0.25)] shrink-0">
          <Layers size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#E6EDF3]">
            Cartas Digitales
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Gestión y diseño de cartas interactivas con QR para mesas
          </p>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Buscador unificado */}
        <div className="relative w-48 sm:w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E] pointer-events-none" />
          <input 
            type="text"
            placeholder="Buscar cartas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full pl-8 pr-7 rounded-lg bg-[#1C2333] border border-[#30363D] text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/60 focus:outline-none focus:border-[#F0B429] transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filtros */}
        <button
          onClick={onFiltersToggle}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-semibold transition-all ${
            filtersOpen || hasActiveFilters
              ? 'bg-[#21283A] border-[rgba(240,180,41,0.40)] text-[#F0B429]'
              : 'bg-[#1C2333] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D]'
          }`}
        >
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#F0B429]" />}
        </button>

        {/* Modo Constructor vs Catálogo */}
        <button
          onClick={onBuilderModeToggle}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-semibold transition-all ${
            builderMode
              ? 'bg-[rgba(240,180,41,0.15)] border-[#F0B429] text-[#F0B429] font-bold'
              : 'bg-[#1C2333] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D]'
          }`}
          title={builderMode ? 'Volver al catálogo' : 'Abrir Menu Studio (Constructor)'}
        >
          <Sparkles size={14} className={builderMode ? "text-[#F0B429]" : "text-[#8B949E]"} />
          <span>{builderMode ? 'Ver Catálogo' : 'Menu Studio'}</span>
        </button>

        {/* Selector de modo Simple / Avanzado */}
        <div className="flex items-center bg-[#1C2333] border border-[#30363D] rounded-lg p-0.5">
          <button
            onClick={() => onModeChange('simple')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              mode === 'simple'
                ? 'bg-[#21283A] text-[#F0B429] border border-[rgba(240,180,41,0.30)] font-bold shadow-sm'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => onModeChange('advanced')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              mode === 'advanced'
                ? 'bg-[#21283A] text-[#F0B429] border border-[rgba(240,180,41,0.30)] font-bold shadow-sm'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            Avanzado
          </button>
        </div>

        {/* Toggle Vista Cuadrícula / Lista */}
        <button
          onClick={onViewToggle}
          className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#30363D] bg-[#1C2333] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
          title={`Vista: ${view === 'grid' ? 'Cuadrícula' : 'Lista'}`}
        >
          {view === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
        </button>

        {/* Actualizar */}
        <button
          onClick={onRefresh}
          className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#30363D] bg-[#1C2333] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
          title="Actualizar cartas"
        >
          <RefreshCcw size={15} className={loading ? "animate-spin text-[#F0B429]" : ""} />
        </button>

        {/* Tutorial */}
        <button
          onClick={onOpenTutorial}
          className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#30363D] bg-[#1C2333] text-[#8B949E] hover:text-[#F0B429] hover:border-[#F0B429]/40 transition-colors"
          title="Ver tutorial interactivo"
        >
          <HelpCircle size={15} />
        </button>

        {/* CTA + NUEVA CARTA */}
        <button
          onClick={onNewMenu}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#F0B429] hover:bg-[#F5C842] text-black font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>Nueva Carta</span>
        </button>
      </div>
    </header>
  );
}
