import { useMemo } from 'react';
import type { Recipe, RecipeHealthScore } from '../types';
import { useRecipeCost } from './useRecipeCost';
import { useRecipeAvailability } from './useRecipeAvailability';

interface UseRecipeHealthScoreProps {
  recipe: Recipe;
  inventoryItems: any[];
  allRecipes?: Recipe[];
}

/**
 * Hook para calcular el Health Score de una receta
 * Analiza Costo, Disponibilidad, Tiempo, Complejidad, Rentabilidad, Consistencia, Presentación, Producción
 */
export function useRecipeHealthScore({ recipe, inventoryItems, allRecipes = [] }: UseRecipeHealthScoreProps): RecipeHealthScore {
  const { totalCost, ingredientCosts } = useRecipeCost({ 
    ingredients: recipe.ingredients, 
    inventoryItems 
  });
  const { isAvailable, missingIngredients } = useRecipeAvailability({ 
    ingredients: recipe.ingredients, 
    inventoryItems 
  });

  return useMemo(() => {
    const costScore = calculateCostScore(recipe, totalCost);
    const availabilityScore = calculateAvailabilityScore(isAvailable, missingIngredients);
    const timeScore = calculateTimeScore(recipe);
    const complexityScore = calculateComplexityScore(recipe);
    const profitabilityScore = calculateProfitabilityScore(recipe, totalCost);
    const consistencyScore = calculateConsistencyScore(recipe, allRecipes);
    const presentationScore = calculatePresentationScore(recipe);
    const productionScore = calculateProductionScore(recipe);

    const overall = Math.round(
      (costScore * 0.15 +
      availabilityScore * 0.2 +
      timeScore * 0.1 +
      complexityScore * 0.1 +
      profitabilityScore * 0.2 +
      consistencyScore * 0.1 +
      presentationScore * 0.05 +
      productionScore * 0.1)
    );

    return {
      overall,
      cost: costScore,
      availability: availabilityScore,
      time: timeScore,
      complexity: complexityScore,
      profitability: profitabilityScore,
      consistency: consistencyScore,
      presentation: presentationScore,
      production: productionScore,
    };
  }, [recipe, totalCost, isAvailable, missingIngredients, allRecipes]);
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
  if (margin >= 30) return 50;
  if (margin >= 20) return 40;
  return 20;
}

function calculateAvailabilityScore(isAvailable: boolean, missingIngredients: any[]): number {
  if (isAvailable) return 100;
  
  const missingCount = missingIngredients.length;
  const totalIngredients = missingIngredients.length + (isAvailable ? 0 : 1);
  
  if (totalIngredients === 0) return 100;
  const missingPercentage = (missingCount / totalIngredients) * 100;
  
  return Math.max(0, 100 - missingPercentage);
}

function calculateTimeScore(recipe: Recipe): number {
  const stepCount = recipe.steps?.length || 0;
  const ingredientCount = recipe.ingredients.length;
  const estimatedTime = stepCount * 2 + ingredientCount * 0.5;
  
  if (estimatedTime <= 3) return 100;
  if (estimatedTime <= 5) return 90;
  if (estimatedTime <= 7) return 80;
  if (estimatedTime <= 10) return 70;
  if (estimatedTime <= 15) return 60;
  if (estimatedTime <= 20) return 50;
  return 30;
}

function calculateComplexityScore(recipe: Recipe): number {
  const ingredientCount = recipe.ingredients.length;
  const stepCount = recipe.steps?.length || 0;
  
  if (ingredientCount <= 3 && stepCount <= 2) return 100;
  if (ingredientCount <= 5 && stepCount <= 4) return 90;
  if (ingredientCount <= 7 && stepCount <= 6) return 80;
  if (ingredientCount <= 10 && stepCount <= 8) return 70;
  if (ingredientCount <= 15 && stepCount <= 12) return 60;
  return 40;
}

function calculateProfitabilityScore(recipe: Recipe, totalCost: number): number {
  const price = recipe.product?.price || 0;
  if (price === 0) return 50;
  
  const margin = ((price - totalCost) / price) * 100;
  
  if (margin >= 85) return 100;
  if (margin >= 75) return 90;
  if (margin >= 65) return 80;
  if (margin >= 55) return 70;
  if (margin >= 45) return 60;
  if (margin >= 35) return 50;
  return 30;
}

function calculateConsistencyScore(recipe: Recipe, allRecipes: Recipe[]): number {
  if (allRecipes.length === 0) return 100;
  
  const similarRecipes = allRecipes.filter(r => 
    r.category === recipe.category && 
    r.type === recipe.type
  );
  
  if (similarRecipes.length === 0) return 100;
  
  const avgIngredientCount = similarRecipes.reduce((sum, r) => sum + r.ingredients.length, 0) / similarRecipes.length;
  const avgStepCount = similarRecipes.reduce((sum, r) => sum + (r.steps?.length || 0), 0) / similarRecipes.length;
  
  const ingredientDiff = Math.abs(recipe.ingredients.length - avgIngredientCount);
  const stepDiff = Math.abs((recipe.steps?.length || 0) - avgStepCount);
  
  const consistencyScore = 100 - (ingredientDiff * 5 + stepDiff * 5);
  return Math.max(0, Math.min(100, consistencyScore));
}

function calculatePresentationScore(recipe: Recipe): number {
  let score = 100;
  
  if (!recipe.image) score -= 20;
  if (!recipe.specifications?.glass) score -= 15;
  if (!recipe.specifications?.ice) score -= 10;
  if (!recipe.decorationIds || recipe.decorationIds.length === 0) score -= 15;
  if (!recipe.method) score -= 10;
  
  return Math.max(0, score);
}

function calculateProductionScore(recipe: Recipe): number {
  const stepCount = recipe.steps?.length || 0;
  const ingredientCount = recipe.ingredients.length;
  
  if (stepCount <= 3 && ingredientCount <= 5) return 100;
  if (stepCount <= 5 && ingredientCount <= 8) return 90;
  if (stepCount <= 8 && ingredientCount <= 12) return 80;
  if (stepCount <= 12 && ingredientCount <= 15) return 70;
  return 50;
}
