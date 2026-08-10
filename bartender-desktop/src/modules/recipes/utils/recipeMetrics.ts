import type { Recipe } from '../types';

/**
 * Calculate recipe complexity based on ingredients and steps
 * Returns: 'Baja', 'Media', or 'Alta'
 */
export function calculateComplexity(recipe: Recipe): string {
  const ingredientCount = recipe?.ingredients?.length || 0;
  const stepCount = recipe?.steps?.length || 0;
  
  // Complexity score based on ingredient count and step count
  const score = ingredientCount * 0.6 + stepCount * 0.4;
  
  if (score <= 3) return 'Baja';
  if (score <= 7) return 'Media';
  return 'Alta';
}

/**
 * Calculate estimated preparation time in minutes
 * Based on ingredient count, step count, and step times
 */
export function calculateEstimatedTime(recipe: Recipe): number {
  if (!recipe?.steps?.length) {
    // Estimate based on ingredient count if no steps
    const ingredientCount = recipe?.ingredients?.length || 0;
    return Math.max(1, ingredientCount * 2); // 2 minutes per ingredient
  }
  
  // Sum up step times, defaulting to 30 seconds per step if not specified
  let totalTime = 0;
  for (const step of recipe.steps) {
    totalTime += step.time || 30; // Default 30 seconds per step
  }
  
  // Convert to minutes
  return Math.ceil(totalTime / 60);
}

/**
 * Calculate recipe yield based on ingredient quantities
 * Returns total volume in ml
 */
export function calculateRecipeYield(recipe: Recipe): number {
  if (!recipe?.ingredients?.length) return 0;
  
  let totalVolume = 0;
  const UNIT_CONVERSION: Record<string, number> = {
    ml: 1,
    l: 1000,
    oz: 29.5735,
    unit: 1,
    portion: 1,
  };
  
  for (const ingredient of recipe.ingredients) {
    const unit = UNIT_CONVERSION[ingredient.unit] || 1;
    totalVolume += ingredient.quantity * unit;
  }
  
  return Math.round(totalVolume);
}
