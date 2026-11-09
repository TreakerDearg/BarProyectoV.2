"use client";

import { useMemo, useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Wine,
  ChefHat,
  Package,
  Layers,
  Sparkles,
  PieChart,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldAlert,
  Percent,
} from "lucide-react";
import type { Recipe } from "../types/recipe";
import { getDashboardStats, getDashboardWarnings } from "../services/recipeService";

interface Props {
  recipes: Recipe[];
  onCreateNew: (type: "drink" | "food") => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function RecipeExecutiveDashboard({
  recipes,
  onCreateNew,
  onSelectRecipe,
}: Props) {
  const [stats, setStats] = useState<any>(null);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsData, warningsData] = await Promise.allSettled([
          getDashboardStats(),
          getDashboardWarnings(),
        ]);

        if (statsData.status === "fulfilled" && statsData.value?.stats) {
          setStats(statsData.value.stats);
        }
        if (warningsData.status === "fulfilled" && Array.isArray(warningsData.value)) {
          setWarnings(warningsData.value);
        }
      } catch (err) {
        console.warn("Could not load remote dashboard data, using local calculation", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [Array.isArray(recipes) ? recipes.length : 0]);

  // Local calculations for real-time accuracy
  const calculations = useMemo(() => {
    const safeRecipes = Array.isArray(recipes) ? recipes : [];
    const total = safeRecipes.length;
    const drinks = safeRecipes.filter((r) => r?.type === "drink");
    const foods = safeRecipes.filter((r) => r?.type === "food");
    const variants = safeRecipes.filter((r) => r && (!r.isPrimary || r.parentId));
    const masters = safeRecipes.filter((r) => r && (r.isPrimary !== false && !r.parentId));

    // Margins and costs
    let totalDrinkCost = 0;
    let totalDrinkPrice = 0;
    let totalFoodCost = 0;
    let totalFoodPrice = 0;

    const lowMarginRecipes: { recipe: Recipe; margin: number }[] = [];

    safeRecipes.forEach((r) => {
      if (!r) return;
      const price = typeof r.product === "object" && r.product?.price ? r.product.price : 0;
      const cost = r.totalCost || 0;
      const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

      if (price > 0 && margin < 40) {
        lowMarginRecipes.push({ recipe: r, margin });
      }

      if (r.type === "drink") {
        totalDrinkCost += cost;
        totalDrinkPrice += price;
      } else {
        totalFoodCost += cost;
        totalFoodPrice += price;
      }
    });

    const avgDrinkCostPct =
      totalDrinkPrice > 0 ? Math.round((totalDrinkCost / totalDrinkPrice) * 100) : 22;
    const avgFoodCostPct =
      totalFoodPrice > 0 ? Math.round((totalFoodCost / totalFoodPrice) * 100) : 28;

    const overallMargin =
      totalDrinkPrice + totalFoodPrice > 0
        ? Math.round(
            ((totalDrinkPrice + totalFoodPrice - (totalDrinkCost + totalFoodCost)) /
              (totalDrinkPrice + totalFoodPrice)) *
              100
          )
        : 74;

    // Categories distribution
    const categoryMap: Record<string, number> = {};
    recipes.forEach((r) => {
      const cat = r.category || "General";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    // Top profitable
    const topProfitable = [...recipes]
      .map((r) => {
        const price = typeof r.product === "object" && r.product?.price ? r.product.price : 0;
        const cost = r.totalCost || 0;
        const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
        return { recipe: r, margin, cost, price };
      })
      .filter((x) => x.price > 0)
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);

    return {
      total,
      drinksCount: drinks.length,
      foodsCount: foods.length,
      variantsCount: variants.length,
      mastersCount: masters.length,
      avgDrinkCostPct,
      avgFoodCostPct,
      overallMargin,
      categoryMap,
      topProfitable,
      lowMarginRecipes,
    };
  }, [recipes]);

  return (
    <div className="space-y-6">
      {/* KPI Ribbons: 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cobertura de Fichas */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Fichas Activas
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-dark border border-border/60 flex items-center justify-center text-text-primary">
              <Layers className="w-4 h-4 text-cyan" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary font-mono">
              {calculations.total}
            </span>
            <span className="text-xs text-text-muted">
              ({calculations.mastersCount} maestras / {calculations.variantsCount} variantes)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-cyan font-medium">
              <Wine className="w-3 h-3" /> {calculations.drinksCount} Barra
            </span>
            <span className="text-border">|</span>
            <span className="inline-flex items-center gap-1 text-amber font-medium">
              <ChefHat className="w-3 h-3" /> {calculations.foodsCount} Cocina
            </span>
          </div>
        </div>

        {/* KPI 2: Beverage Cost Promedio */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Beverage Cost %
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan">
              <Wine className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan font-mono">
              {calculations.avgDrinkCostPct}%
            </span>
            <span className="text-xs text-emerald font-semibold">
              Objetivo: &le; 24%
            </span>
          </div>
          <div className="mt-3 w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                calculations.avgDrinkCostPct <= 24 ? "bg-cyan" : "bg-red"
              }`}
              style={{ width: `${Math.min(calculations.avgDrinkCostPct, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Food Cost Promedio */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Food Cost %
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber/10 border border-amber/30 flex items-center justify-center text-amber">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber font-mono">
              {calculations.avgFoodCostPct}%
            </span>
            <span className="text-xs text-emerald font-semibold">
              Objetivo: &le; 30%
            </span>
          </div>
          <div className="mt-3 w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                calculations.avgFoodCostPct <= 30 ? "bg-amber" : "bg-red"
              }`}
              style={{ width: `${Math.min(calculations.avgFoodCostPct, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Margen Bruto Ponderado */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Margen Ponderado
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gold font-mono">
              {calculations.overallMargin}%
            </span>
            <span className="text-xs text-text-muted">
              Rentabilidad global
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Escandallo saludable
          </div>
        </div>
      </div>

      {/* Middle Layout: Top Profitable + Warnings / Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Fichas Más Rentables */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                Fichas con Mayor Margen Operativo
              </h3>
              <p className="text-xs text-text-muted">
                Platos y cócteles con mayor rentabilidad unitaria
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {calculations.topProfitable.length > 0 ? (
              calculations.topProfitable.map((item, idx) => {
                const name =
                  typeof item.recipe.product === "object" && item.recipe.product
                    ? item.recipe.product.name
                    : (item.recipe as any).name || "Receta";
                const isDrink = item.recipe.type === "drink";

                return (
                  <div
                    key={idx}
                    onClick={() => onSelectRecipe(item.recipe)}
                    className="p-3 rounded-xl bg-surface-dark/50 border border-border/50 hover:border-gold/40 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-surface-card border border-border/60 text-text-muted flex items-center justify-center text-xs font-bold font-mono">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          {isDrink ? (
                            <Wine className="w-3 h-3 text-cyan" />
                          ) : (
                            <ChefHat className="w-3 h-3 text-amber" />
                          )}
                          <span className="text-xs font-semibold text-text-primary group-hover:text-gold transition-colors">
                            {name}
                          </span>
                        </div>
                        <span className="text-[11px] text-text-muted">
                          Costo: ${item.cost.toLocaleString()} | Venta: ${item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald">
                        {item.margin}%
                      </span>
                      <span className="text-[10px] text-text-muted block">
                        Margen
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-text-muted py-4 text-center">
                No hay recetas con precios cargados para calcular el ranking.
              </p>
            )}
          </div>
        </div>

        {/* Alertas & Fichas con Margen Bajo */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red" />
                Alertas de Rentabilidad & Escandallo
              </h3>
              <p className="text-xs text-text-muted">
                Fichas con margen inferior al 40% o insumos en punto de reorden
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red/10 text-red border border-red/20 font-mono">
              {calculations.lowMarginRecipes.length} críticas
            </span>
          </div>

          <div className="space-y-2.5">
            {calculations.lowMarginRecipes.length > 0 ? (
              calculations.lowMarginRecipes.slice(0, 5).map((item, idx) => {
                const name =
                  typeof item.recipe.product === "object" && item.recipe.product
                    ? item.recipe.product.name
                    : (item.recipe as any).name || "Receta";

                return (
                  <div
                    key={idx}
                    onClick={() => onSelectRecipe(item.recipe)}
                    className="p-3 rounded-xl bg-red/5 border border-red/20 hover:border-red/40 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-red/10 flex items-center justify-center text-red">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-text-primary block">
                          {name}
                        </span>
                        <span className="text-[11px] text-red/80">
                          Margen bajo ({item.margin}%) — Requiere ajuste de precio o gramaje
                        </span>
                      </div>
                    </div>

                    <button className="text-xs font-medium text-gold hover:underline flex items-center gap-1">
                      Ver Ficha <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center rounded-xl bg-surface-dark/40 border border-border/50 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald mx-auto" />
                <h4 className="text-xs font-semibold text-text-primary">
                  Todos los escandallos están optimizados
                </h4>
                <p className="text-[11px] text-text-muted">
                  No se detectaron recetas con márgenes comprometidos por debajo del umbral del 40%.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Category Distribution */}
      <div className="bg-surface-card border border-border/60 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <PieChart className="w-4 h-4 text-gold" />
          Distribución por Categorías
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(calculations.categoryMap).map(([cat, count]) => (
            <div
              key={cat}
              className="bg-surface-dark/60 border border-border/50 rounded-xl p-3 text-center space-y-1 hover:border-gold/30 transition-colors"
            >
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block truncate">
                {cat}
              </span>
              <span className="text-lg font-bold font-mono text-text-primary">
                {count}
              </span>
              <span className="text-[10px] text-text-muted block">
                fichas técnicas
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

