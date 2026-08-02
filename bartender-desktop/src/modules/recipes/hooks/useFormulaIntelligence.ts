import { useMemo } from 'react';
import type { Recipe, FormulaAnalysis, FormulaIssue, FormulaSuggestion } from '../types';
import { useRecipeCost } from './useRecipeCost';
import { useRecipeAvailability } from './useRecipeAvailability';

interface UseFormulaIntelligenceProps {
  recipe: Recipe;
  inventoryItems: any[];
}

/**
 * Hook para análisis inteligente de fórmulas
 * Analiza balance, costo, dificultad, tiempo, disponibilidad, margen, desperdicio, reutilización, consistencia
 */
export function useFormulaIntelligence({ recipe, inventoryItems }: UseFormulaIntelligenceProps): FormulaAnalysis {
  const { totalCost } = useRecipeCost({ 
    ingredients: recipe.ingredients, 
    inventoryItems 
  });
  const { isAvailable, missingIngredients } = useRecipeAvailability({ 
    ingredients: recipe.ingredients, 
    inventoryItems 
  });

  return useMemo(() => {
    const balance = calculateBalance(recipe);
    const cost = calculateCostScore(recipe, totalCost);
    const difficulty = calculateDifficulty(recipe);
    const time = calculateTimeScore(recipe);
    const availability = calculateAvailabilityScore(isAvailable, missingIngredients);
    const margin = calculateMarginScore(recipe, totalCost);
    const waste = calculateWasteScore(recipe, inventoryItems);
    const reusability = calculateReusabilityScore(recipe);
    const consistency = calculateConsistencyScore(recipe);
    
    const issues = generateIssues(recipe, totalCost, isAvailable, missingIngredients, inventoryItems);
    const suggestions = generateSuggestions(recipe, totalCost, inventoryItems);

    return {
      balance,
      cost,
      difficulty,
      time,
      availability,
      margin,
      waste,
      reusability,
      consistency,
      issues,
      suggestions,
    };
  }, [recipe, totalCost, isAvailable, missingIngredients, inventoryItems]);
}

function calculateBalance(recipe: Recipe): number {
  const ingredientCount = recipe.ingredients.length;
  if (ingredientCount < 3) return 50;
  if (ingredientCount > 15) return 60;
  
  const hasSpirit = recipe.ingredients.some(ing => 
    ing.inventoryItem.name.toLowerCase().includes('gin') ||
    ing.inventoryItem.name.toLowerCase().includes('vodka') ||
    ing.inventoryItem.name.toLowerCase().includes('rum') ||
    ing.inventoryItem.name.toLowerCase().includes('whisky')
  );
  
  const hasMixer = recipe.ingredients.some(ing => 
    ing.inventoryItem.name.toLowerCase().includes('tonic') ||
    ing.inventoryItem.name.toLowerCase().includes('soda') ||
    ing.inventoryItem.name.toLowerCase().includes('jugo')
  );
  
  const hasAcid = recipe.ingredients.some(ing => 
    ing.inventoryItem.name.toLowerCase().includes('limón') ||
    ing.inventoryItem.name.toLowerCase().includes('lima')
  );
  
  if (hasSpirit && hasMixer && hasAcid) return 100;
  if (hasSpirit && hasMixer) return 85;
  if (hasSpirit && hasAcid) return 80;
  
  return 70;
}

function calculateCostScore(recipe: Recipe, totalCost: number): number {
  const price = recipe.product?.price || 0;
  if (price === 0) return 50;
  
  const margin = ((price - totalCost) / price) * 100;
  
  if (margin >= 80) return 100;
  if (margin >= 70) return 90;
  if (margin >= 60) return 80;
  if (margin >= 50) return 70;
  if (margin >= 40) return 60;
  return 40;
}

function calculateDifficulty(recipe: Recipe): number {
  const ingredientCount = recipe.ingredients.length;
  const stepCount = recipe.steps?.length || 0;
  
  if (ingredientCount <= 3 && stepCount <= 2) return 100;
  if (ingredientCount <= 5 && stepCount <= 4) return 90;
  if (ingredientCount <= 7 && stepCount <= 6) return 80;
  if (ingredientCount <= 10 && stepCount <= 8) return 70;
  return 50;
}

function calculateTimeScore(recipe: Recipe): number {
  const stepCount = recipe.steps?.length || 0;
  const ingredientCount = recipe.ingredients.length;
  const estimatedTime = stepCount * 2 + ingredientCount * 0.5;
  
  if (estimatedTime <= 3) return 100;
  if (estimatedTime <= 5) return 90;
  if (estimatedTime <= 7) return 80;
  if (estimatedTime <= 10) return 70;
  return 50;
}

function calculateAvailabilityScore(isAvailable: boolean, missingIngredients: any[]): number {
  if (isAvailable) return 100;
  
  const missingCount = missingIngredients.length;
  const totalIngredients = missingIngredients.length + (isAvailable ? 0 : 1);
  
  if (totalIngredients === 0) return 100;
  const missingPercentage = (missingCount / totalIngredients) * 100;
  
  return Math.max(0, 100 - missingPercentage);
}

function calculateMarginScore(recipe: Recipe, totalCost: number): number {
  const price = recipe.product?.price || 0;
  if (price === 0) return 50;
  
  const margin = ((price - totalCost) / price) * 100;
  
  if (margin >= 85) return 100;
  if (margin >= 75) return 90;
  if (margin >= 65) return 80;
  if (margin >= 55) return 70;
  return 50;
}

function calculateWasteScore(recipe: Recipe, inventoryItems: any[]): number {
  let wasteScore = 100;
  
  recipe.ingredients.forEach(ingredient => {
    const inventoryItem = inventoryItems.find(item => item._id === ingredient.inventoryItem._id);
    if (!inventoryItem) return;
    
    const used = ingredient.quantity;
    const available = inventoryItem.stock || 0;
    const unit = ingredient.unit;
    
    if (unit === 'unit' && used < 1 && available > 0) {
      const wastePercentage = ((available - used) / available) * 100;
      if (wastePercentage > 50) wasteScore -= 20;
    }
  });
  
  return Math.max(0, wasteScore);
}

function calculateReusabilityScore(recipe: Recipe): number {
  if (recipe.isPrimary) return 100;
  if (recipe.parentId) return 90;
  return 70;
}

function calculateConsistencyScore(recipe: Recipe): number {
  let score = 100;
  
  if (!recipe.image) score -= 15;
  if (!recipe.specifications?.glass) score -= 10;
  if (!recipe.specifications?.ice) score -= 5;
  if (!recipe.method) score -= 10;
  if (!recipe.category) score -= 10;
  
  return Math.max(0, score);
}

function generateIssues(recipe: Recipe, totalCost: number, isAvailable: boolean, _missingIngredients: any[], _inventoryItems: any[]): FormulaIssue[] {
  const issues: FormulaIssue[] = [];
  
  if (!isAvailable) {
    issues.push({
      type: 'error',
      message: 'Ingredientes no disponibles',
      severity: 'high',
      field: 'ingredients',
    });
  }
  
  const price = recipe.product?.price || 0;
  if (price > 0) {
    const margin = ((price - totalCost) / price) * 100;
    if (margin < 30) {
      issues.push({
        type: 'warning',
        message: `Margen bajo: ${margin.toFixed(0)}%`,
        severity: 'medium',
        field: 'cost',
      });
    }
  }
  
  if (recipe.ingredients.length > 15) {
    issues.push({
      type: 'warning',
      message: 'Demasiados ingredientes',
      severity: 'medium',
      field: 'ingredients',
    });
  }
  
  if (!recipe.image) {
    issues.push({
      type: 'info',
      message: 'Receta sin imagen',
      severity: 'low',
      field: 'image',
    });
  }
  
  return issues;
}

function generateSuggestions(recipe: Recipe, totalCost: number, _inventoryItems: any[]): FormulaSuggestion[] {
  const suggestions: FormulaSuggestion[] = [];
  
  const price = recipe.product?.price || 0;
  if (price > 0) {
    const margin = ((price - totalCost) / price) * 100;
    if (margin < 50) {
      suggestions.push({
        type: 'cost',
        message: 'Considera reducir costos para mejorar margen',
        action: 'Revisar ingredientes caros',
        priority: 'high',
      });
    }
  }
  
  if (recipe.ingredients.length > 10) {
    suggestions.push({
      type: 'production',
      message: 'Considera simplificar la receta',
      action: 'Reducir ingredientes no esenciales',
      priority: 'medium',
    });
  }
  
  if (!recipe.decorationIds || recipe.decorationIds.length === 0) {
    suggestions.push({
      type: 'decoration',
      message: 'Añade decoración para mejorar presentación',
      action: 'Seleccionar decoración de biblioteca',
      priority: 'low',
    });
  }
  
  return suggestions;
}
