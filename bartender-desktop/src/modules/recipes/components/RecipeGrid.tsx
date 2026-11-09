"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  BookOpen,
  ChefHat,
  Filter,
  Plus,
  Sparkles,
  Wine,
} from "lucide-react";
import type { Recipe } from "../types/recipe";
import RecipeCard from "./RecipeCard";

interface Props {
  recipes: Recipe[];
  activeStation: "all" | "drink" | "food";
  selectedCategory: string;
  searchQuery: string;
  loading?: boolean;
  onViewRecipe: (recipe: Recipe) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onAddVariant: (recipe: Recipe) => void;
  onCreateNew: (type: "drink" | "food") => void;
}

type SortOption = "name-asc" | "cost-asc" | "cost-desc" | "margin-desc" | "ingredients-desc";

export default function RecipeGrid({
  recipes = [],
  activeStation,
  selectedCategory,
  searchQuery,
  loading = false,
  onViewRecipe,
  onEditRecipe,
  onAddVariant,
  onCreateNew,
}: Props) {
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const safeRecipes = useMemo(() => (Array.isArray(recipes) ? recipes : []), [recipes]);

  // Map variant count per master recipe ID
  const variantsCountMap = useMemo(() => {
    const map = new Map<string, number>();
    safeRecipes.forEach((r) => {
      if (r?.parentId) {
        map.set(r.parentId, (map.get(r.parentId) || 0) + 1);
      }
    });
    return map;
  }, [safeRecipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return safeRecipes.filter((r) => {
      if (!r) return false;
      // Station filter
      if (activeStation !== "all" && r.type !== activeStation) {
        return false;
      }

      // Category filter
      if (
        selectedCategory &&
        selectedCategory !== "all" &&
        r.category?.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const productName =
          typeof r.product === "object" && r.product
            ? r.product.name.toLowerCase()
            : (r as any).name?.toLowerCase() || "";
        const cat = r.category?.toLowerCase() || "";
        const method = r.method?.toLowerCase() || "";
        const ingredientMatch = r.ingredients?.some((ing) =>
          typeof ing.inventoryItem === "object" && ing.inventoryItem
            ? ing.inventoryItem.name?.toLowerCase().includes(query)
            : false
        );

        if (
          !productName.includes(query) &&
          !cat.includes(query) &&
          !method.includes(query) &&
          !ingredientMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, activeStation, selectedCategory, searchQuery]);

  // Sort recipes
  const sortedRecipes = useMemo(() => {
    return [...filteredRecipes].sort((a, b) => {
      const nameA = (
        typeof a.product === "object" && a.product
          ? a.product.name
          : (a as any).name || ""
      ).toLowerCase();
      const nameB = (
        typeof b.product === "object" && b.product
          ? b.product.name
          : (b as any).name || ""
      ).toLowerCase();

      const costA = a.totalCost || 0;
      const costB = b.totalCost || 0;

      const priceA =
        typeof a.product === "object" && a.product?.price ? a.product.price : 0;
      const priceB =
        typeof b.product === "object" && b.product?.price ? b.product.price : 0;

      const marginA = priceA > 0 ? ((priceA - costA) / priceA) * 100 : 0;
      const marginB = priceB > 0 ? ((priceB - costB) / priceB) * 100 : 0;

      switch (sortBy) {
        case "name-asc":
          return nameA.localeCompare(nameB);
        case "cost-asc":
          return costA - costB;
        case "cost-desc":
          return costB - costA;
        case "margin-desc":
          return marginB - marginA;
        case "ingredients-desc":
          return (b.ingredients?.length || 0) - (a.ingredients?.length || 0);
        default:
          return 0;
      }
    });
  }, [filteredRecipes, sortBy]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-80 bg-surface-dark/60 rounded-xl border border-border/40 p-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-full h-36 bg-surface-card/60 rounded-lg" />
              <div className="h-4 bg-surface-card/80 rounded w-3/4" />
              <div className="h-3 bg-surface-card/60 rounded w-1/2" />
            </div>
            <div className="h-8 bg-surface-card/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar: Results Count + Sort selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Mostrando</span>
          <span className="font-semibold text-text-primary px-2 py-0.5 rounded-full bg-surface-card border border-border/50">
            {sortedRecipes.length}
          </span>
          <span>fichas técnicas</span>
          {activeStation !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-card text-text-primary border border-border/60">
              {activeStation === "drink" ? (
                <>
                  <Wine className="w-3 h-3 text-cyan" /> Barra
                </>
              ) : (
                <>
                  <ChefHat className="w-3 h-3 text-amber" /> Cocina
                </>
              )}
            </span>
          )}
          {selectedCategory && selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
              <Filter className="w-3 h-3" /> {selectedCategory}
            </span>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" /> Ordenar:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs bg-surface-card text-text-primary border border-border/60 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold/50 cursor-pointer"
          >
            <option value="name-asc">Nombre (A - Z)</option>
            <option value="margin-desc">Mayor Margen %</option>
            <option value="cost-asc">Menor Costo Insumos</option>
            <option value="cost-desc">Mayor Costo Insumos</option>
            <option value="ingredients-desc">Más Insumos</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {sortedRecipes.length === 0 ? (
        <div className="bg-surface-dark/50 border border-border/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-card border border-border/60 flex items-center justify-center text-text-muted">
            <BookOpen className="w-8 h-8 text-gold/60" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-semibold text-text-primary">
              No se encontraron fichas técnicas
            </h3>
            <p className="text-xs text-text-muted">
              {searchQuery || selectedCategory !== "all"
                ? "No hay fichas que coincidan con los filtros seleccionados. Intenta ajustar la búsqueda o limpiar los filtros."
                : "Aún no se han configurado fichas técnicas en este sector. Comienza registrando un cóctel de barra o plato de cocina."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onCreateNew("drink")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-cyan/15 text-cyan border border-cyan/30 hover:bg-cyan/25 transition-colors"
            >
              <Wine className="w-3.5 h-3.5" />
              Nueva Ficha de Barra
            </button>
            <button
              onClick={() => onCreateNew("food")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-amber/15 text-amber border border-amber/30 hover:bg-amber/25 transition-colors"
            >
              <ChefHat className="w-3.5 h-3.5" />
              Nueva Ficha de Cocina
            </button>
          </div>
        </div>
      ) : (
        /* Recipes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedRecipes.map((recipe) => {
            const recipeId = recipe._id || "";
            const variantsCount = variantsCountMap.get(recipeId) || 0;
            return (
              <RecipeCard
                key={recipeId || Math.random().toString()}
                recipe={recipe}
                variantsCount={variantsCount}
                onView={onViewRecipe}
                onEdit={onEditRecipe}
                onAddVariant={onAddVariant}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

