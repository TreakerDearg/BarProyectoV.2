import { useMemo } from 'react';
import type { Recipe, ProductionAnalysis } from '../types';
import { useRecipeCost } from './useRecipeCost';

interface UseProductionAnalyzerProps {
  recipe: Recipe;
  inventoryItems: any[];
}

/**
 * Hook para análisis de producción
 * Analiza tiempo total, ingredientes difíciles, ingredientes caros, preparaciones largas, utensilios, cambios
 */
export function useProductionAnalyzer({ recipe, inventoryItems }: UseProductionAnalyzerProps): ProductionAnalysis {
  const { totalCost } = useRecipeCost({ 
    ingredients: recipe.ingredients, 
    inventoryItems 
  });

  return useMemo(() => {
    const totalTime = calculateTotalTime(recipe);
    const difficulty = calculateDifficulty(recipe);
    const utensils = calculateUtensils(recipe);
    const cost = totalCost;
    const margin = calculateMargin(recipe, totalCost);
    const difficultIngredients = identifyDifficultIngredients(recipe);
    const expensiveIngredients = identifyExpensiveIngredients(recipe, inventoryItems);
    const longPreparations = identifyLongPreparations(recipe);
    const glassChanges = calculateGlassChanges(recipe);
    const techniqueChanges = calculateTechniqueChanges(recipe);
    const stepCount = recipe.steps?.length || 0;

    return {
      totalTime,
      difficulty,
      utensils,
      cost,
      margin,
      difficultIngredients,
      expensiveIngredients,
      longPreparations,
      glassChanges,
      techniqueChanges,
      stepCount,
    };
  }, [recipe, totalCost, inventoryItems]);
}

function calculateTotalTime(recipe: Recipe): number {
  const stepCount = recipe.steps?.length || 0;
  const ingredientCount = recipe.ingredients.length;
  return Math.round(stepCount * 2 + ingredientCount * 0.5);
}

function calculateDifficulty(recipe: Recipe): 'low' | 'medium' | 'high' {
  const ingredientCount = recipe.ingredients.length;
  const stepCount = recipe.steps?.length || 0;
  
  if (ingredientCount <= 3 && stepCount <= 2) return 'low';
  if (ingredientCount <= 6 && stepCount <= 4) return 'medium';
  return 'high';
}

function calculateUtensils(recipe: Recipe): number {
  const utensilsSet = new Set<string>();
  
  recipe.steps?.forEach(step => {
    step.utensils?.forEach(utensil => utensilsSet.add(utensil));
  });
  
  return utensilsSet.size;
}

function calculateMargin(recipe: Recipe, totalCost: number): number {
  const price = recipe.product?.price || 0;
  if (price === 0) return 0;
  return ((price - totalCost) / price) * 100;
}

function identifyDifficultIngredients(recipe: Recipe): string[] {
  const difficultIngredients: string[] = [];
  
  const difficultKeywords = ['muddle', 'infusion', 'syrup', 'reduction', 'foam', 'egg'];
  
  recipe.ingredients.forEach(ingredient => {
    const name = ingredient.inventoryItem.name.toLowerCase();
    if (difficultKeywords.some(keyword => name.includes(keyword))) {
      difficultIngredients.push(ingredient.inventoryItem.name);
    }
  });
  
  return difficultIngredients;
}

function identifyExpensiveIngredients(recipe: Recipe, inventoryItems: any[]): string[] {
  const expensiveIngredients: string[] = [];
  
  recipe.ingredients.forEach(ingredient => {
    const inventoryItem = inventoryItems.find(item => item._id === ingredient.inventoryItem._id);
    if (!inventoryItem) return;
    
    const cost = inventoryItem.cost || 0;
    if (cost > 5) {
      expensiveIngredients.push(ingredient.inventoryItem.name);
    }
  });
  
  return expensiveIngredients;
}

function identifyLongPreparations(recipe: Recipe): string[] {
  const longPreparations: string[] = [];
  
  recipe.steps?.forEach(step => {
    if (step.duration && step.duration > 5) {
      longPreparations.push(step.instruction);
    }
  });
  
  return longPreparations;
}

function calculateGlassChanges(recipe: Recipe): number {
  return recipe.specifications?.glass ? 1 : 0;
}

function calculateTechniqueChanges(recipe: Recipe): number {
  const techniques = new Set<string>();
  
  recipe.steps?.forEach(step => {
    if (step.technique) {
      techniques.add(step.technique);
    }
  });
  
  return techniques.size;
}
