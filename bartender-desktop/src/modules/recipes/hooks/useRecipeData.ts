import { useMemo } from 'react';
import { useRecipes, useRecipe, useDrinkProductsWithRecipes } from './useRecipeQueries';

/**
 * Hook centralizado para cargar datos de recetas
 * Usa TanStack Query para caché y optimización
 * Centraliza la lógica de carga de recetas para todas las vistas
 */
export function useRecipeData(recipeId?: string, options?: { useProducts?: boolean }) {
  // Cargar receta individual si se proporciona ID
  const recipeQuery = useRecipe(recipeId || '');

  // Cargar todas las recetas si no se proporciona ID
  const recipesQuery = useRecipes();

  // Cargar productos con recetas (opcional, para vistas específicas)
  const productsQuery = useDrinkProductsWithRecipes({ available: true });

  const data = useMemo(() => {
    if (recipeId) {
      return {
        recipe: recipeQuery.data || null,
        recipes: [],
        products: [],
        loading: recipeQuery.isLoading,
        error: recipeQuery.error,
        refetch: recipeQuery.refetch,
      };
    }

    return {
      recipe: null,
      recipes: recipesQuery.data || [],
      products: options?.useProducts ? (productsQuery.data || []) : [],
      loading: recipesQuery.isLoading || (options?.useProducts ? productsQuery.isLoading : false),
      error: recipesQuery.error || (options?.useProducts ? productsQuery.error : null),
      refetch: () => {
        recipesQuery.refetch();
        if (options?.useProducts) productsQuery.refetch();
      },
    };
  }, [recipeId, recipeQuery, recipesQuery, productsQuery, options]);

  return data;
}

/**
 * Hook para cargar datos de recetas para el Recipe Studio
 * Combina recetas e inventario en una sola llamada
 */
export function useRecipeStudioData(recipeId?: string, inventoryItems: any[] = []) {
  const recipeQuery = useRecipe(recipeId || '');
  const recipesQuery = useRecipes();

  const data = useMemo(() => {
    if (recipeId) {
      return {
        recipe: recipeQuery.data || null,
        allRecipes: [],
        inventoryItems,
        loading: recipeQuery.isLoading,
        error: recipeQuery.error,
        refetch: recipeQuery.refetch,
      };
    }

    return {
      recipe: null,
      allRecipes: recipesQuery.data || [],
      inventoryItems,
      loading: recipesQuery.isLoading,
      error: recipesQuery.error,
      refetch: recipesQuery.refetch,
    };
  }, [recipeId, recipeQuery, recipesQuery, inventoryItems]);

  return data;
}
