import { createContext, useContext, useMemo, useEffect, useState, type ReactNode } from 'react';
import type { Recipe, RecipeHealthScore, RecipeRelation, RecipeWarning, FormulaSuggestion, RecipeAnalyticsMini } from '../types';
import {
  getDashboardWarnings,
  getDashboardSuggestions,
  getRecipeTimeline,
  checkRecipeAvailability,
} from '../services/recipeService';

interface RecipeStudioContextValue {
  recipe:            Recipe;
  inventoryItems:    any[];
  allRecipes:        Recipe[];
  totalCost:         number;
  margin:            number;
  isAvailable:       boolean;
  missingIngredients:any[];
  healthScore:       RecipeHealthScore;
  analytics:         RecipeAnalyticsMini;
  relations:         RecipeRelation[];
  warnings:          RecipeWarning[];
  suggestions:       FormulaSuggestion[];
  versions:          any[];
  logsLoading:       boolean;
}

const RecipeStudioContext = createContext<RecipeStudioContextValue | undefined>(undefined);

interface RecipeStudioProviderProps {
  children:       ReactNode;
  recipe:         Recipe;
  inventoryItems: any[];
  allRecipes?:    Recipe[];
}

export function RecipeStudioProvider({ children, recipe, inventoryItems, allRecipes = [] }: RecipeStudioProviderProps) {
  // ── Valores derivados del backend (sin recalcular en frontend) ──
  const totalCost = recipe.totalCost || 0;
  const margin    = useMemo(() => {
    const price = recipe.product?.price || 0;
    if (!price) return 0;
    return Number(((price - totalCost) / price * 100).toFixed(2));
  }, [recipe.product, totalCost]);

  // ── Estado cargado desde el backend ────────────────────────────
  const [isAvailable,        setIsAvailable]        = useState(true);
  const [missingIngredients, setMissingIngredients] = useState<any[]>([]);
  const [warnings,           setWarnings]           = useState<RecipeWarning[]>([]);
  const [suggestions,        setSuggestions]        = useState<FormulaSuggestion[]>([]);
  const [versions,           setVersions]           = useState<any[]>([]);
  const [logsLoading,        setLogsLoading]        = useState(false);

  // Cargar disponibilidad de la receta activa
  useEffect(() => {
    if (!recipe?._id) return;
    checkRecipeAvailability(recipe._id)
      .then((data: any) => {
        setIsAvailable(data?.isAvailable !== false);
        setMissingIngredients(data?.missingIngredients || []);
      })
      .catch(() => {
        setIsAvailable(true);
        setMissingIngredients([]);
      });
  }, [recipe?._id]);

  // Cargar warnings del dashboard (globales, no por receta)
  useEffect(() => {
    setLogsLoading(true);
    getDashboardWarnings()
      .then((data) => setWarnings(data as any[]))
      .catch(() => setWarnings([]))
      .finally(() => setLogsLoading(false));
  }, []);

  // Cargar sugerencias del dashboard
  useEffect(() => {
    getDashboardSuggestions()
      .then((data) => setSuggestions(data as any[]))
      .catch(() => setSuggestions([]));
  }, []);

  // Cargar timeline de la receta activa
  useEffect(() => {
    if (!recipe?._id) { setVersions([]); return; }
    getRecipeTimeline(recipe._id)
      .then((data) => setVersions(data || []))
      .catch(() => setVersions([]));
  }, [recipe?._id]);

  // ── Analytics computados (ingredientes + variantes reales) ──────
  const analytics = useMemo<RecipeAnalyticsMini>(() => {
    const variantCount    = allRecipes.filter((r) => r.parentId === recipe._id).length;
    const ingredientCount = recipe.ingredients?.length ?? 0;
    const stepCount       = recipe.steps?.length ?? 0;
    const time            = Math.round(stepCount * 2 + ingredientCount * 0.5);
    const complexity      = ingredientCount <= 3 && stepCount <= 2 ? 'low'
                          : ingredientCount <= 5 && stepCount <= 4 ? 'medium'
                          : 'high';
    return {
      popularity:     null,          // requiere data de ventas desde el backend
      margin,
      cost:           totalCost,
      time,
      complexity,
      ingredientCount,
      variantCount,
      productCount:   recipe.product ? 1 : 0,
    };
  }, [recipe, totalCost, margin, allRecipes]);

  // ── Health score calculado desde datos reales ───────────────────
  const healthScore: RecipeHealthScore = useMemo(() => {
    const hasImage   = !!(recipe.image);
    const hasSteps   = (recipe.steps?.length ?? 0) > 0;
    const hasIngr    = (recipe.ingredients?.length ?? 0) > 1;
    const goodMargin = margin > 30;
    const costOk     = totalCost > 0;

    const overall = Math.round(
      (hasImage   ? 20 : 0) +
      (hasSteps   ? 20 : 0) +
      (hasIngr    ? 15 : 0) +
      (goodMargin ? 25 : 10) +
      (costOk     ? 20 : 0)
    );

    return {
      overall,
      cost:           costOk     ? 85 : 30,
      availability:   isAvailable ? 90 : 40,
      time:           hasSteps   ? 80 : 50,
      complexity:     hasIngr    ? 75 : 40,
      profitability:  goodMargin ? 85 : 40,
      consistency:    hasSteps && hasIngr ? 80 : 50,
      presentation:   hasImage   ? 85 : 30,
      production:     hasIngr && hasSteps ? 80 : 45,
    };
  }, [recipe, margin, totalCost, isAvailable]);

  const value = useMemo<RecipeStudioContextValue>(() => ({
    recipe, inventoryItems, allRecipes,
    totalCost, margin,
    isAvailable, missingIngredients,
    healthScore, analytics,
    relations: [],
    warnings, suggestions, versions,
    logsLoading,
  }), [
    recipe, inventoryItems, allRecipes,
    totalCost, margin,
    isAvailable, missingIngredients,
    healthScore, analytics,
    warnings, suggestions, versions,
    logsLoading,
  ]);

  return (
    <RecipeStudioContext.Provider value={value}>
      {children}
    </RecipeStudioContext.Provider>
  );
}

export function useRecipeStudio() {
  const ctx = useContext(RecipeStudioContext);
  if (!ctx) throw new Error('useRecipeStudio must be used within RecipeStudioProvider');
  return ctx;
}
