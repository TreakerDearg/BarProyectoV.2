import { useMemo } from 'react';
import type { Recipe } from '../types';

interface RecipeMarginData {
  margin: number;
  marginPercentage: number;
  isProfitable: boolean;
  suggestedPrice: number;
}

/**
 * Hook para calcular el margin de una receta
 * Calcula la diferencia entre el precio del producto y el costo de la receta
 */
export function useRecipeMargin(recipe: Recipe, totalCost: number): RecipeMarginData {
  return useMemo(() => {
    const price = recipe.product?.price || 0;
    
    if (price === 0) {
      return {
        margin: 0,
        marginPercentage: 0,
        isProfitable: false,
        suggestedPrice: totalCost * 1.5, // Sugerir precio con 50% de margen
      };
    }

    const margin = price - totalCost;
    const marginPercentage = price > 0 ? (margin / price) * 100 : 0;
    const isProfitable = margin > 0;
    
    // Sugerir precio si no es rentable (mínimo 30% de margen)
    const suggestedPrice = !isProfitable ? totalCost / 0.7 : price;

    return {
      margin,
      marginPercentage,
      isProfitable,
      suggestedPrice,
    };
  }, [recipe, totalCost]);
}
