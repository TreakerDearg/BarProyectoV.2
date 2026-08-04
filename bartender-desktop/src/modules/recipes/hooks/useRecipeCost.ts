import { useMemo } from 'react';
import type { RecipeIngredient } from '../types';
import { calculateRecipeCost, calculateIngredientCost, calculateIngredientPercentage } from '../utils/costCalculator';

interface UseRecipeCostProps {
  ingredients: RecipeIngredient[];
  inventoryItems: Array<{ _id?: string; cost: number; unit: string }>;
}

interface RecipeCostData {
  totalCost: number;
  ingredientCosts: Map<string, number>;
  ingredientPercentages: Map<string, number>;
  averageCostPerIngredient: number;
}

/**
 * Hook para calcular costos de receta
 * Centraliza la lógica de cálculo para eliminar duplicación
 */
export function useRecipeCost({ ingredients, inventoryItems }: UseRecipeCostProps): RecipeCostData {
  return useMemo(() => {
    const totalCost = calculateRecipeCost(ingredients, inventoryItems);
    
    const ingredientCosts = new Map<string, number>();
    const ingredientPercentages = new Map<string, number>();

    const inventoryMap = new Map(
      inventoryItems.map((item) => [item._id || '', item])
    );

    for (const ingredient of ingredients) {
      if (!ingredient.inventoryItem || !ingredient.inventoryItem._id) continue;
      
      const inventoryItem = inventoryMap.get(ingredient.inventoryItem._id);
      if (!inventoryItem) continue;

      const cost = calculateIngredientCost(ingredient, inventoryItem);
      const percentage = calculateIngredientPercentage(cost, totalCost);

      ingredientCosts.set(ingredient.inventoryItem._id, cost);
      ingredientPercentages.set(ingredient.inventoryItem._id, percentage);
    }

    const averageCostPerIngredient = ingredients.length > 0 
      ? totalCost / ingredients.length 
      : 0;

    return {
      totalCost,
      ingredientCosts,
      ingredientPercentages,
      averageCostPerIngredient,
    };
  }, [ingredients, inventoryItems]);
}
