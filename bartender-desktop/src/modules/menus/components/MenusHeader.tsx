"use client";

import { Search, LayoutDashboard, List, Grid3x3, RefreshCcw, Plus, Filter, HelpCircle } from "lucide-react";

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

function ModeToggle({ mode, onChange }: { mode: 'simple' | 'advanced'; onChange: (mode: 'simple' | 'advanced') => void }) {
  return (
    <div className="nebula-mode-toggle">
      <button
        onClick={() => onChange('simple')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          mode === 'simple'
            ? 'bg-violet-500/20 text-violet-300 border border-violet-400/30'
            : 'text-muted hover:text-violet-200'
        }`}
      >
        Simple
      </button>
      <button
        onClick={() => onChange('advanced')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          mode === 'advanced'
            ? 'bg-violet-500/20 text-violet-300 border border-violet-400/30'
            : 'text-muted hover:text-violet-200'
        }`}
      >
        Avanzado
      </button>
    </div>
  );
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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-400/20 shadow-[0_0_24px_rgba(139,92,246,0.15)]">
          <LayoutDashboard className="text-violet-200" size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ivory">
            Cartas Digitales
          </h1>
          <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
            <span className="text-violet-400/70">●</span>
            Menu Architecture · Nebula v3
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-violet-300/60 group-focus-within:text-violet-200 transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Buscar cartas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-surface-3/60 border border-violet-400/20 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium text-ivory outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/10 transition-all w-64 backdrop-blur-sm"
          />
        </div>

        <button
          onClick={onFiltersToggle}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
            filtersOpen || hasActiveFilters
              ? 'bg-gold/10 border-gold/30 text-gold'
              : 'border-white/10 text-muted hover:text-violet-200 hover:border-violet-400/30'
          }`}
        >
          <Filter size={16} />
          <span>Filtros</span>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-gold" />}
        </button>

        <button
          onClick={onOpenTutorial}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
          title="Tutorial de cartas"
        >
          <HelpCircle size={16} />
          Tutorial
        </button>

        <ModeToggle mode={mode} onChange={onModeChange} />

        <button
          onClick={onBuilderModeToggle}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
            builderMode
              ? 'bg-rose/10 border-rose/30 text-rose-300'
              : 'border-white/10 text-muted hover:text-violet-200 hover:border-violet-400/30'
          }`}
          title={builderMode ? 'Vista Normal' : 'Constructor de Menús'}
        >
          <Grid3x3 size={16} />
          <span>{builderMode ? 'Normal' : 'Constructor'}</span>
        </button>

        <button
          onClick={onViewToggle}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
          title={`Vista: ${view === 'grid' ? 'Cuadrícula' : 'Lista'}`}
        >
          {view === 'grid' ? <LayoutDashboard size={16} /> : <List size={16} />}
        </button>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
          title="Actualizar"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
        </button>

        <button
          onClick={onNewMenu}
          className="nebula-btn-primary flex items-center gap-2 px-5 py-2.5"
        >
          <Plus size={18} />
          <span className="text-xs font-bold tracking-wide uppercase">Nueva Carta</span>
        </button>
      </div>
    </header>
  );
}
