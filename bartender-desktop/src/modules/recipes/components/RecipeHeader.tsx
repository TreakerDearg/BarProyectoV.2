"use client";

import {
  BookOpen,
  Wine,
  ChefHat,
  BarChart3,
  Search,
  Plus,
  TrendingUp,
  Percent,
  Layers,
  Filter,
} from "lucide-react";
import type { Recipe } from "../types/recipe";

interface Props {
  activeStation: "all" | "drink" | "food" | "dashboard";
  onStationChange: (station: "all" | "drink" | "food" | "dashboard") => void;
  search: string;
  onSearchChange: (search: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  recipes: Recipe[];
  onNewRecipe: (station: "drink" | "food") => void;
}

export default function RecipeHeader({
  activeStation,
  onStationChange,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  recipes,
  onNewRecipe,
}: Props) {
  const drinkCount = recipes.filter((r) => r.type === "drink").length;
  const foodCount = recipes.filter((r) => r.type === "food").length;

  // Cálculo del margen promedio real
  const recipesWithPrice = recipes.filter(
    (r) => r.product && typeof r.product === "object" && (r.product.price || 0) > 0
  );
  const avgMargin =
    recipesWithPrice.length > 0
      ? Math.round(
          recipesWithPrice.reduce((sum, r) => {
            const price = (r.product as any).price || 0;
            const cost = r.totalCost || 0;
            const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
            return sum + margin;
          }, 0) / recipesWithPrice.length
        )
      : 0;

  return (
    <div className="flex flex-col gap-5 pb-6 border-b border-border">
      {/* ── Fila Superior: Título & Botones de Acción Primarios ── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gold/10 text-gold border border-gold/30 shadow-gold-glow">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-ivory tracking-tight uppercase">
              Fichas Técnicas & <span className="text-gold">Recetario</span>
            </h1>
            <p className="text-xs text-muted font-bold uppercase tracking-wider mt-0.5">
              Ingeniería de Costos, Variantes & Protocolos Operativos
            </p>
          </div>
        </div>

        {/* Acciones de Alta por Estación */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button
            onClick={() => onNewRecipe("drink")}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-bg text-xs font-black uppercase tracking-wider shadow-gold-glow transition-all cursor-pointer"
          >
            <Wine size={15} />
            <span>+ Ficha de Barra</span>
          </button>

          <button
            onClick={() => onNewRecipe("food")}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-ivory border border-border hover:border-gold/30 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <ChefHat size={15} className="text-emerald" />
            <span>+ Ficha de Cocina</span>
          </button>
        </div>
      </div>

      {/* ── Fila de Métricas Clave ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-surface-2 border border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
              Fichas Totales
            </span>
            <span className="text-2xl font-black text-ivory">{recipes.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-3 border border-border text-gold">
            <Layers size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2 border border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
              Estación Barra
            </span>
            <span className="text-2xl font-black text-gold">{drinkCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold">
            <Wine size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2 border border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
              Estación Cocina
            </span>
            <span className="text-2xl font-black text-emerald">{foodCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald">
            <ChefHat size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2 border border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
              Margen Ponderado
            </span>
            <span className="text-2xl font-black text-emerald">{avgMargin}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald">
            <Percent size={18} />
          </div>
        </div>
      </div>

      {/* ── Fila de Filtros & Pestañas de Estación ── */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 pt-2">
        {/* Selector de Pestañas de Estación */}
        <div className="flex bg-surface-2 p-1 rounded-2xl border border-border overflow-x-auto">
          {(
            [
              { id: "all", label: `Todas (${recipes.length})`, icon: BookOpen },
              { id: "drink", label: `🍸 Barra (${drinkCount})`, icon: Wine },
              { id: "food", label: `🍳 Cocina (${foodCount})`, icon: ChefHat },
              { id: "dashboard", label: "📊 Centro de Control", icon: BarChart3 },
            ] as const
          ).map((tab) => {
            const isActive = activeStation === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStationChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gold text-bg shadow-sm"
                    : "text-muted hover:text-ivory"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador & Selector de Categoría (solo visible en modo catálogo) */}
        {activeStation !== "dashboard" && (
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Buscar por nombre o insumo..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-ivory placeholder:text-muted/60 focus:outline-none focus:border-gold/50 font-medium"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-ivory font-bold focus:outline-none focus:border-gold/50"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

