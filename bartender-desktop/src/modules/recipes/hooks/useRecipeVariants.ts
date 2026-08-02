import { useMemo } from 'react';
import type { Recipe, RecipeVariant, RecipeTree } from '../types';

interface UseRecipeVariantsProps {
  recipes: Recipe[];
  masterRecipeId?: string;
}

interface RecipeVariantsData {
  masterRecipes: Recipe[];
  variantsByMaster: Map<string, RecipeVariant[]>;
  recipeTree: RecipeTree | null;
  allVariants: RecipeVariant[];
}

/**
 * Hook para gestión de variantes de recetas
 * Centraliza la lógica de organización de recetas base y variantes
 */
export function useRecipeVariants({ recipes, masterRecipeId }: UseRecipeVariantsProps): RecipeVariantsData {
  return useMemo(() => {
    // Identificar recetas base (isPrimary = true o sin parentId)
    const masterRecipes = recipes.filter((recipe) => recipe.isPrimary || !recipe.parentId);

    // Agrupar variantes por receta base
    const variantsByMaster = new Map<string, RecipeVariant[]>();
    const allVariants: RecipeVariant[] = [];

    for (const recipe of recipes) {
      if (recipe.parentId && !recipe.isPrimary) {
        const variant: RecipeVariant = {
          _id: recipe._id || '',
          variantName: recipe.variantName || 'Variante',
          isPrimary: recipe.isPrimary || false,
          parentId: recipe.parentId,
          recipe,
        };

        allVariants.push(variant);

        const parentId = recipe.parentId;
        if (!variantsByMaster.has(parentId)) {
          variantsByMaster.set(parentId, []);
        }
        variantsByMaster.get(parentId)!.push(variant);
      }
    }

    // Construir árbol de recetas si se especifica un masterRecipeId
    let recipeTree: RecipeTree | null = null;
    if (masterRecipeId) {
      const master = recipes.find((r) => r._id === masterRecipeId);
      if (master) {
        const variants = variantsByMaster.get(masterRecipeId) || [];
        recipeTree = {
          master,
          variants,
          depth: calculateTreeDepth(master, variants, variantsByMaster),
        };
      }
    }

    return {
      masterRecipes,
      variantsByMaster,
      recipeTree,
      allVariants,
    };
  }, [recipes, masterRecipeId]);
}

function calculateTreeDepth(
  _master: Recipe,
  variants: RecipeVariant[],
  variantsByMaster: Map<string, RecipeVariant[]>
): number {
  if (variants.length === 0) return 1;

  let maxDepth = 1;
  for (const variant of variants) {
    const childVariants = variantsByMaster.get(variant._id) || [];
    const childDepth = calculateTreeDepth(variant.recipe, childVariants, variantsByMaster);
    maxDepth = Math.max(maxDepth, childDepth + 1);
  }

  return maxDepth;
}
