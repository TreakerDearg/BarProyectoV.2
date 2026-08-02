import { useMemo } from 'react';
import type { Recipe, RecipeRelation } from '../types';

interface UseRecipeRelationsProps {
  recipe: Recipe;
  allRecipes: Recipe[];
}

/**
 * Hook para análisis de relaciones entre recetas
 * Conexiones basadas en ingredientes, técnicas, familia, variantes
 */
export function useRecipeRelations({ recipe, allRecipes }: UseRecipeRelationsProps): RecipeRelation[] {
  return useMemo(() => {
    const relations: RecipeRelation[] = [];

    // Variantes
    allRecipes.forEach(otherRecipe => {
      if (otherRecipe._id === recipe._id) return;
      
      if (otherRecipe.parentId === recipe._id) {
        relations.push({
          recipeId: otherRecipe._id,
          recipeName: otherRecipe.product?.name || 'Sin nombre',
          relationType: 'variant',
          similarity: 100,
        });
      }
      
      if (recipe.parentId === otherRecipe._id) {
        relations.push({
          recipeId: otherRecipe._id,
          recipeName: otherRecipe.product?.name || 'Sin nombre',
          relationType: 'variant',
          similarity: 100,
        });
      }
    });

    // Recetas similares por ingredientes
    allRecipes.forEach(otherRecipe => {
      if (otherRecipe._id === recipe._id) return;
      
      const commonIngredients = recipe.ingredients.filter(ing => 
        otherRecipe.ingredients.some(otherIng => 
          otherIng.inventoryItem._id === ing.inventoryItem._id
        )
      );
      
      if (commonIngredients.length >= 2) {
        const similarity = (commonIngredients.length / Math.max(recipe.ingredients.length, otherRecipe.ingredients.length)) * 100;
        
        if (similarity >= 30) {
          relations.push({
            recipeId: otherRecipe._id,
            recipeName: otherRecipe.product?.name || 'Sin nombre',
            relationType: 'ingredient',
            similarity: Math.round(similarity),
          });
        }
      }
    });

    // Recetas similares por técnica
    if (recipe.method) {
      allRecipes.forEach(otherRecipe => {
        if (otherRecipe._id === recipe._id) return;
        
        if (otherRecipe.method === recipe.method) {
          relations.push({
            recipeId: otherRecipe._id,
            recipeName: otherRecipe.product?.name || 'Sin nombre',
            relationType: 'technique',
            similarity: 60,
          });
        }
      });
    }

    // Recetas de la misma familia (categoría)
    allRecipes.forEach(otherRecipe => {
      if (otherRecipe._id === recipe._id) return;
      
      if (otherRecipe.category === recipe.category && otherRecipe.type === recipe.type) {
        const existingRelation = relations.find(r => r.recipeId === otherRecipe._id);
        if (!existingRelation) {
          relations.push({
            recipeId: otherRecipe._id,
            recipeName: otherRecipe.product?.name || 'Sin nombre',
            relationType: 'family',
            similarity: 40,
          });
        }
      }
    });

    // Ordenar por similitud
    return relations.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  }, [recipe, allRecipes]);
}
