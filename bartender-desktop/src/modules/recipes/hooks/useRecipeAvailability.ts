import { useMemo } from 'react';
import type { RecipeIngredient } from '../types';
import { checkIngredientAvailability } from '../utils/costCalculator';

interface UseRecipeAvailabilityProps {
  ingredients: RecipeIngredient[];
  inventoryItems: Array<{ _id?: string; stock: number; unit: string }>;
}

interface IngredientAvailability {
  inventoryItemId: string;
  name: string;
  required: number;
  available: number;
  unit: string;
  isAvailable: boolean;
}

interface RecipeAvailabilityData {
  isAvailable: boolean;
  missingIngredients: IngredientAvailability[];
  availableIngredients: IngredientAvailability[];
  totalIngredients: number;
}

/**
 * Hook para verificar disponibilidad de ingredientes de una receta
 * Centraliza la lógica de verificación de stock
 */
export function useRecipeAvailability({ ingredients, inventoryItems }: UseRecipeAvailabilityProps): RecipeAvailabilityData {
  return useMemo(() => {
    const inventoryMap = new Map(
      inventoryItems.map((item) => [item._id, item])
    );

    const ingredientAvailability: IngredientAvailability[] = ingredients.map((ingredient) => {
      if (!ingredient.inventoryItem || !ingredient.inventoryItem._id) {
        return {
          inventoryItemId: ingredient.inventoryItem?._id || '',
          name: ingredient.inventoryItem?.name || 'Desconocido',
          required: ingredient.quantity,
          available: 0,
          unit: ingredient.unit,
          isAvailable: false,
        };
      }
      
      const inventoryItem = inventoryMap.get(ingredient.inventoryItem._id);
      
      if (!inventoryItem) {
        return {
          inventoryItemId: ingredient.inventoryItem._id,
          name: ingredient.inventoryItem.name || 'Desconocido',
          required: ingredient.quantity,
          available: 0,
          unit: ingredient.unit,
          isAvailable: false,
        };
      }

      const isAvailable = checkIngredientAvailability(ingredient, inventoryItem);

      return {
        inventoryItemId: ingredient.inventoryItem._id,
        name: ingredient.inventoryItem.name,
        required: ingredient.quantity,
        available: inventoryItem.stock,
        unit: ingredient.unit,
        isAvailable,
      };
    });

    const missingIngredients = ingredientAvailability.filter((ing) => !ing.isAvailable);
    const availableIngredients = ingredientAvailability.filter((ing) => ing.isAvailable);

    return {
      isAvailable: missingIngredients.length === 0,
      missingIngredients,
      availableIngredients,
      totalIngredients: ingredients.length,
    };
  }, [ingredients, inventoryItems]);
}
