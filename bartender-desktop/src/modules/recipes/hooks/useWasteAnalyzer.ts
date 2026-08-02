import { useMemo } from 'react';
import type { Recipe, WasteAnalysis, WasteItem, WasteSuggestion } from '../types';

interface UseWasteAnalyzerProps {
  recipe: Recipe;
  inventoryItems: any[];
}

/**
 * Hook para análisis de desperdicio
 * Detecta desperdicio y genera sugerencias de optimización
 */
export function useWasteAnalyzer({ recipe, inventoryItems }: UseWasteAnalyzerProps): WasteAnalysis {
  return useMemo(() => {
    const wasteItems = calculateWasteItems(recipe, inventoryItems);
    const totalWaste = wasteItems.reduce((sum, item) => sum + item.wastePercentage, 0) / Math.max(wasteItems.length, 1);
    const suggestions = generateWasteSuggestions(wasteItems, inventoryItems);

    return {
      totalWaste,
      wasteItems,
      suggestions,
    };
  }, [recipe, inventoryItems]);
}

function calculateWasteItems(recipe: Recipe, inventoryItems: any[]): WasteItem[] {
  const wasteItems: WasteItem[] = [];

  recipe.ingredients.forEach(ingredient => {
    const inventoryItem = inventoryItems.find(item => item._id === ingredient.inventoryItem._id);
    if (!inventoryItem) return;

    const used = ingredient.quantity;
    const available = inventoryItem.stock || 0;
    const unit = ingredient.unit;

    if (unit === 'unit' && used < 1 && available > 0) {
      const wastePercentage = ((available - used) / available) * 100;
      if (wastePercentage > 30) {
        wasteItems.push({
          ingredient: ingredient.inventoryItem.name,
          used,
          available,
          wastePercentage,
          unit,
        });
      }
    }
  });

  return wasteItems;
}

function generateWasteSuggestions(wasteItems: WasteItem[], _inventoryItems: any[]): WasteSuggestion[] {
  const suggestions: WasteSuggestion[] = [];

  wasteItems.forEach(wasteItem => {
    if (wasteItem.wastePercentage > 70) {
      suggestions.push({
        message: `Alto desperdicio de ${wasteItem.ingredient}`,
        action: 'Preparar cordial o compartir con otra receta',
        potentialSavings: wasteItem.available - wasteItem.used,
      });
    } else if (wasteItem.wastePercentage > 50) {
      suggestions.push({
        message: `Desperdicio moderado de ${wasteItem.ingredient}`,
        action: 'Considerar usar jugo embotellado',
        potentialSavings: wasteItem.available - wasteItem.used,
      });
    }
  });

  return suggestions;
}
