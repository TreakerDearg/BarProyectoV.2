import type { RecipeIngredient } from '../types';

/**
 * Sistema de conversión de unidades basado en backend
 * UNIT_CONVERSION del backend: { ml: 1, l: 1000, g: 1, kg: 1000, oz: 29.5735, unit: 1, portion: 1 }
 */
const UNIT_CONVERSION: Record<string, number> = {
  ml: 1,
  l: 1000,
  g: 1,
  kg: 1000,
  oz: 29.5735,
  unit: 1,
  portion: 1,
};

/**
 * Calcula el costo total de una receta basándose en los ingredientes y sus costos del inventario
 * Esta función alinea con la lógica del backend (Recipe.js calculateCost)
 */
export function calculateRecipeCost(
  ingredients: RecipeIngredient[],
  inventoryItems: Array<{ _id?: string; cost: number; unit: string }>
): number {
  if (!ingredients?.length) return 0;

  const inventoryMap = new Map(
    inventoryItems.map((item) => [item._id || '', item])
  );

  let total = 0;

  for (const ingredient of ingredients) {
    const inventoryItem = inventoryMap.get(ingredient.inventoryItem._id);
    if (!inventoryItem) continue;

    // Normalización de unidades (alineado con backend)
    const recipeUnit = UNIT_CONVERSION[ingredient.unit] || 1;
    const inventoryUnit = UNIT_CONVERSION[inventoryItem.unit] || 1;

    const normalizedQty =
      ingredient.quantity *
      recipeUnit *
      (ingredient.baseUnitMultiplier || 1);

    const costPerBaseUnit = (inventoryItem.cost || 0) / inventoryUnit;

    total += costPerBaseUnit * normalizedQty;
  }

  return Number(total.toFixed(2));
}

/**
 * Calcula el costo por ingrediente individual
 */
export function calculateIngredientCost(
  ingredient: RecipeIngredient,
  inventoryItem: { cost: number; unit: string }
): number {
  const recipeUnit = UNIT_CONVERSION[ingredient.unit] || 1;
  const inventoryUnit = UNIT_CONVERSION[inventoryItem.unit] || 1;

  const normalizedQty =
    ingredient.quantity *
    recipeUnit *
    (ingredient.baseUnitMultiplier || 1);

  const costPerBaseUnit = (inventoryItem.cost || 0) / inventoryUnit;

  return Number((costPerBaseUnit * normalizedQty).toFixed(2));
}

/**
 * Verifica si un ingrediente está disponible en stock
 */
export function checkIngredientAvailability(
  ingredient: RecipeIngredient,
  inventoryItem: { stock: number; unit: string }
): boolean {
  const recipeUnit = UNIT_CONVERSION[ingredient.unit] || 1;
  const inventoryUnit = UNIT_CONVERSION[inventoryItem.unit] || 1;

  const normalizedQty =
    ingredient.quantity *
    recipeUnit *
    (ingredient.baseUnitMultiplier || 1);

  const normalizedStock = inventoryItem.stock * inventoryUnit;

  return normalizedStock >= normalizedQty;
}

/**
 * Calcula el porcentaje de un ingrediente respecto al costo total
 */
export function calculateIngredientPercentage(
  ingredientCost: number,
  totalCost: number
): number {
  if (totalCost === 0) return 0;
  return Number(((ingredientCost / totalCost) * 100).toFixed(1));
}
