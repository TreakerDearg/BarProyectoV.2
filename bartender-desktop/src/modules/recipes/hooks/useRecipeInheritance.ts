import { useMemo } from 'react';
import type { Recipe, InheritanceSettings } from '../types';

interface UseRecipeInheritanceProps {
  variant: Recipe;
  masterRecipe: Recipe;
  inheritanceSettings?: InheritanceSettings;
}

interface InheritedRecipe {
  ingredients: Recipe['ingredients'];
  steps: Recipe['steps'];
  method: Recipe['method'];
  specifications: Recipe['specifications'];
  category: Recipe['category'];
  drinkStyle: Recipe['drinkStyle'];
  inheritedFields: string[];
  overriddenFields: string[];
}

/**
 * Hook para herencia inteligente de recetas
 * Permite que una variante herede selectivamente campos de la receta base
 */
export function useRecipeInheritance({
  variant,
  masterRecipe,
  inheritanceSettings,
}: UseRecipeInheritanceProps): InheritedRecipe {
  return useMemo(() => {
    const settings = inheritanceSettings || getDefaultInheritanceSettings();
    
    const inheritedFields: string[] = [];
    const overriddenFields: string[] = [];

    // Ingredientes
    let ingredients = variant.ingredients;
    if (settings.inheritIngredients && (!variant.ingredients || variant.ingredients.length === 0)) {
      ingredients = masterRecipe.ingredients;
      inheritedFields.push('ingredients');
    } else if (variant.ingredients && variant.ingredients.length > 0) {
      overriddenFields.push('ingredients');
    }

    // Pasos
    let steps = variant.steps;
    if (settings.inheritSteps && (!variant.steps || variant.steps.length === 0)) {
      steps = masterRecipe.steps;
      inheritedFields.push('steps');
    } else if (variant.steps && variant.steps.length > 0) {
      overriddenFields.push('steps');
    }

    // Método
    let method = variant.method;
    if (settings.inheritMethod && !variant.method) {
      method = masterRecipe.method;
      inheritedFields.push('method');
    } else if (variant.method) {
      overriddenFields.push('method');
    }

    // Especificaciones
    let specifications = variant.specifications;
    if (settings.inheritSpecifications && !variant.specifications) {
      specifications = masterRecipe.specifications;
      inheritedFields.push('specifications');
    } else if (variant.specifications) {
      overriddenFields.push('specifications');
    }

    // Categoría
    let category = variant.category;
    if (settings.inheritCategory && !variant.category) {
      category = masterRecipe.category;
      inheritedFields.push('category');
    } else if (variant.category) {
      overriddenFields.push('category');
    }

    // Drink Style
    let drinkStyle = variant.drinkStyle;
    if (settings.inheritDrinkStyle && !variant.drinkStyle) {
      drinkStyle = masterRecipe.drinkStyle;
      inheritedFields.push('drinkStyle');
    } else if (variant.drinkStyle) {
      overriddenFields.push('drinkStyle');
    }

    return {
      ingredients,
      steps,
      method,
      specifications,
      category,
      drinkStyle,
      inheritedFields,
      overriddenFields,
    };
  }, [variant, masterRecipe, inheritanceSettings]);
}

function getDefaultInheritanceSettings(): InheritanceSettings {
  return {
    inheritIngredients: true,
    inheritSteps: true,
    inheritMethod: true,
    inheritSpecifications: true,
    inheritCategory: true,
    inheritDrinkStyle: true,
  };
}

/**
 * Utilidad para crear una variante a partir de una receta base
 */
export function createVariantFromMaster(
  masterRecipe: Recipe,
  variantName: string,
  inheritanceSettings?: InheritanceSettings
): Partial<Recipe> {
  const settings = inheritanceSettings || getDefaultInheritanceSettings();

  const variant: Partial<Recipe> = {
    parentId: masterRecipe._id,
    variantName,
    isPrimary: false,
    inheritanceSettings: settings,
    type: masterRecipe.type,
  };

  // Solo copiar campos que NO se heredan
  if (!settings.inheritIngredients) {
    variant.ingredients = masterRecipe.ingredients;
  }
  if (!settings.inheritSteps) {
    variant.steps = masterRecipe.steps;
  }
  if (!settings.inheritMethod) {
    variant.method = masterRecipe.method;
  }
  if (!settings.inheritSpecifications) {
    variant.specifications = masterRecipe.specifications;
  }
  if (!settings.inheritCategory) {
    variant.category = masterRecipe.category;
  }
  if (!settings.inheritDrinkStyle) {
    variant.drinkStyle = masterRecipe.drinkStyle;
  }

  return variant;
}
