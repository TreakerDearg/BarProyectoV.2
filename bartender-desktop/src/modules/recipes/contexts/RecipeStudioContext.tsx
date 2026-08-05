import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Recipe, RecipeHealthScore, FormulaAnalysis, ProductionAnalysis, WasteAnalysis, RecipeRelation, RecipeWarning, FormulaSuggestion, RecipeAnalyticsMini } from '../types';
// Eliminados hooks duplicados - ahora usamos datos del backend
// import { useRecipeCost } from '../hooks/useRecipeCost';
// import { useRecipeAvailability } from '../hooks/useRecipeAvailability';
// import { useRecipeHealthScore } from '../hooks/useRecipeHealthScore';
// import { useFormulaIntelligence } from '../hooks/useFormulaIntelligence';
// import { useProductionAnalyzer } from '../hooks/useProductionAnalyzer';
// import { useWasteAnalyzer } from '../hooks/useWasteAnalyzer';
// import { useRecipeRelations } from '../hooks/useRecipeRelations';
// import { useRecipeVersions } from '../hooks/useRecipeVersions';

interface RecipeStudioContextValue {
  // Core data
  recipe: Recipe;
  inventoryItems: any[];
  allRecipes: Recipe[];
  
  // Cost analysis (del backend, no recalcular)
  totalCost: number;
  margin: number;
  
  // Availability (del backend si está disponible, otherwise placeholder)
  isAvailable: boolean;
  missingIngredients: any[];
  
  // Health score (del backend si está disponible, otherwise placeholder)
  healthScore: RecipeHealthScore;
  
  // Analytics (del backend si está disponible, otherwise placeholder)
  analytics: RecipeAnalyticsMini;
  
  // Relations (placeholder hasta que se implemente en backend)
  relations: RecipeRelation[];
  
  // Warnings (placeholder hasta que se implemente en backend)
  warnings: RecipeWarning[];
  
  // Suggestions (placeholder hasta que se implemente en backend)
  suggestions: FormulaSuggestion[];
  
  // Timeline (placeholder hasta que se implemente en backend)
  versions: any[];
}

const RecipeStudioContext = createContext<RecipeStudioContextValue | undefined>(undefined);

interface RecipeStudioProviderProps {
  children: ReactNode;
  recipe: Recipe;
  inventoryItems: any[];
  allRecipes?: Recipe[];
}

/**
 * RecipeStudioContext - Contexto centralizado para Recipe Studio
 * Centraliza Recipe, Product, Inventory, Cost, Health, Availability, Relations, Warnings, Suggestions, Timeline, Versiones, Analytics
 * Ahora usa datos del backend como única fuente de verdad
 */
export function RecipeStudioProvider({ children, recipe, inventoryItems, allRecipes = [] }: RecipeStudioProviderProps) {
  // Usar datos del backend directamente - no recalcular en frontend
  
  // Cost analysis (del backend)
  const totalCost = recipe.totalCost || 0;
  const margin = calculateMarginFromRecipe(recipe);
  
  // Availability (placeholder hasta que se implemente endpoint)
  const isAvailable = true; // TODO: Usar endpoint /recipes/:id/availability
  const missingIngredients = [];
  
  // Health score (placeholder hasta que se implemente en backend)
  const healthScore: RecipeHealthScore = {
    overall: 75,
    cost: 80,
    availability: 90,
    time: 85,
    complexity: 75,
    profitability: 70,
    consistency: 80,
    presentation: 70,
    production: 75,
  };
  
  // Analytics (computed from backend data)
  const analytics = useMemo<RecipeAnalyticsMini>(() => {
    const popularity = 75; // TODO: Usar endpoint /recipes/analytics/:id
    const marginValue = margin;
    const cost = totalCost;
    const time = calculateEstimatedTime(recipe);
    const complexity = calculateComplexity(recipe);
    const ingredientCount = recipe.ingredients.length;
    const variantCount = allRecipes.filter(r => r.parentId === recipe._id).length;
    const productCount = recipe.product ? 1 : 0;
    
    return {
      popularity,
      margin: marginValue,
      cost,
      time,
      complexity,
      ingredientCount,
      variantCount,
      productCount,
    };
  }, [recipe, totalCost, margin, allRecipes, recipe._id]);
  
  // Relations (placeholder)
  const relations: RecipeRelation[] = [];
  
  // Warnings (placeholder hasta que se implemente endpoint /recipes/dashboard/warnings)
  const warnings: RecipeWarning[] = [];
  
  // Suggestions (placeholder hasta que se implemente endpoint /recipes/dashboard/suggestions)
  const suggestions: FormulaSuggestion[] = [];
  
  // Timeline (placeholder hasta que se implemente endpoint /recipes/:id/timeline)
  const versions: any[] = [];
  
  const value = useMemo<RecipeStudioContextValue>(() => ({
    // Core data
    recipe,
    inventoryItems,
    allRecipes,
    
    // Cost analysis (del backend)
    totalCost,
    margin,
    
    // Availability (placeholder)
    isAvailable,
    missingIngredients,
    
    // Health score (placeholder)
    healthScore,
    
    // Analytics (del backend)
    analytics,
    
    // Relations (placeholder)
    relations,
    
    // Warnings (placeholder)
    warnings,
    
    // Suggestions (placeholder)
    suggestions,
    
    // Timeline (placeholder)
    versions,
  }), [
    recipe,
    inventoryItems,
    allRecipes,
    totalCost,
    margin,
    isAvailable,
    missingIngredients,
    healthScore,
    analytics,
    relations,
    warnings,
    suggestions,
    versions,
  ]);
  
  return (
    <RecipeStudioContext.Provider value={value}>
      {children}
    </RecipeStudioContext.Provider>
  );
}

export function useRecipeStudio() {
  const context = useContext(RecipeStudioContext);
  if (!context) {
    throw new Error('useRecipeStudio must be used within RecipeStudioProvider');
  }
  return context;
}

/* =========================================================
   HELPER FUNCTIONS
========================================================= */
function calculateMarginFromRecipe(recipe: Recipe): number {
  const price = recipe.product?.price || 0;
  const cost = recipe.totalCost || 0;
  if (!price || price === 0) return 0;
  return Number(((price - cost) / price * 100).toFixed(2));
}

function calculateEstimatedTime(recipe: Recipe): number {
  const stepCount = recipe.steps?.length || 0;
  const ingredientCount = recipe.ingredients.length;
  return Math.round(stepCount * 2 + ingredientCount * 0.5);
}

function calculateComplexity(recipe: Recipe): string {
  const ingredientCount = recipe.ingredients.length;
  const stepCount = recipe.steps?.length || 0;
  
  if (ingredientCount <= 3 && stepCount <= 2) return 'low';
  if (ingredientCount <= 5 && stepCount <= 4) return 'medium';
  return 'high';
}
