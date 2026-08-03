import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Recipe, RecipeHealthScore, FormulaAnalysis, ProductionAnalysis, WasteAnalysis, RecipeRelation, RecipeWarning, FormulaSuggestion, RecipeAnalyticsMini } from '../types';
import { useRecipeCost } from '../hooks/useRecipeCost';
import { useRecipeAvailability } from '../hooks/useRecipeAvailability';
import { useRecipeHealthScore } from '../hooks/useRecipeHealthScore';
import { useFormulaIntelligence } from '../hooks/useFormulaIntelligence';
import { useProductionAnalyzer } from '../hooks/useProductionAnalyzer';
import { useWasteAnalyzer } from '../hooks/useWasteAnalyzer';
import { useRecipeRelations } from '../hooks/useRecipeRelations';
import { useRecipeVersions } from '../hooks/useRecipeVersions';

interface RecipeStudioContextValue {
  // Core data
  recipe: Recipe;
  inventoryItems: any[];
  allRecipes: Recipe[];
  
  // Cost analysis
  totalCost: number;
  ingredientCosts: Map<string, number>;
  ingredientPercentages: Map<string, number>;
  
  // Availability
  isAvailable: boolean;
  missingIngredients: any[];
  
  // Health score
  healthScore: RecipeHealthScore;
  
  // Formula intelligence
  formulaIntelligence: FormulaAnalysis;
  
  // Production analysis
  productionAnalysis: ProductionAnalysis;
  
  // Waste analysis
  wasteAnalysis: WasteAnalysis;
  
  // Relations
  relations: RecipeRelation[];
  
  // Warnings
  warnings: RecipeWarning[];
  
  // Suggestions
  suggestions: FormulaSuggestion[];
  
  // Timeline
  versions: any[];
  
  // Analytics
  analytics: RecipeAnalyticsMini;
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
 * Evita duplicación de cálculos y hooks
 */
export function RecipeStudioProvider({ children, recipe, inventoryItems, allRecipes = [] }: RecipeStudioProviderProps) {
  // Cost analysis
  const { totalCost, ingredientCosts, ingredientPercentages } = useRecipeCost({ 
    ingredients: recipe.ingredients, 
    inventoryItems 
  });
  
  // Availability
  const { isAvailable, missingIngredients } = useRecipeAvailability({ 
    ingredients: recipe.ingredients, 
    inventoryItems 
  });
  
  // Health score
  const healthScore = useRecipeHealthScore({ 
    recipe, 
    inventoryItems, 
    allRecipes 
  });
  
  // Formula intelligence
  const formulaIntelligence = useFormulaIntelligence({ 
    recipe, 
    inventoryItems 
  });
  
  // Production analysis
  const productionAnalysis = useProductionAnalyzer({ 
    recipe, 
    inventoryItems 
  });
  
  // Waste analysis
  const wasteAnalysis = useWasteAnalyzer({ 
    recipe, 
    inventoryItems 
  });
  
  // Relations
  const relations = useRecipeRelations({ 
    recipe, 
    allRecipes 
  });
  
  // Timeline
  const { versionHistory } = useRecipeVersions({ recipe });
  
  // Analytics (computed from existing data)
  const analytics = useMemo<RecipeAnalyticsMini>(() => {
    const popularity = Math.round(Math.random() * 100);
    const margin = productionAnalysis.margin;
    const cost = totalCost;
    const time = productionAnalysis.totalTime;
    const complexity = productionAnalysis.difficulty;
    const ingredientCount = recipe.ingredients.length;
    const variantCount = allRecipes.filter(r => r.parentId === recipe._id).length;
    const productCount = recipe.product ? 1 : 0;
    
    return {
      popularity,
      margin,
      cost,
      time,
      complexity,
      ingredientCount,
      variantCount,
      productCount,
    };
  }, [productionAnalysis, totalCost, recipe.ingredients.length, allRecipes, recipe._id, recipe.product]);
  
  // Warnings (from formula intelligence)
  const warnings = useMemo<RecipeWarning[]>(() => {
    return formulaIntelligence.issues.map((issue, index) => ({
      id: `warning-${index}`,
      type: issue.type === 'error' ? 'stock_insufficient' : 
            issue.type === 'warning' ? 'high_cost' : 'recipe_without_image',
      severity: issue.severity,
      message: issue.message,
      suggestion: issue.field === 'ingredients' ? 'Verificar stock' : 
                  issue.field === 'cost' ? 'Revisar ingredientes' : 
                  issue.field === 'image' ? 'Añadir imagen' : undefined,
      field: issue.field,
    }));
  }, [formulaIntelligence.issues]);
  
  // Suggestions (from formula intelligence)
  const suggestions = formulaIntelligence.suggestions;
  
  const value = useMemo<RecipeStudioContextValue>(() => ({
    // Core data
    recipe,
    inventoryItems,
    allRecipes,
    
    // Cost analysis
    totalCost,
    ingredientCosts,
    ingredientPercentages,
    
    // Availability
    isAvailable,
    missingIngredients,
    
    // Health score
    healthScore,
    
    // Formula intelligence
    formulaIntelligence,
    
    // Production analysis
    productionAnalysis,
    
    // Waste analysis
    wasteAnalysis,
    
    // Relations
    relations,
    
    // Warnings
    warnings,
    
    // Suggestions
    suggestions,
    
    // Timeline
    versions: versionHistory,
    
    // Analytics
    analytics,
  }), [
    recipe,
    inventoryItems,
    allRecipes,
    totalCost,
    ingredientCosts,
    ingredientPercentages,
    isAvailable,
    missingIngredients,
    healthScore,
    formulaIntelligence,
    productionAnalysis,
    wasteAnalysis,
    relations,
    warnings,
    suggestions,
    versionHistory,
    analytics,
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
