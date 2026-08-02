import { useState, useEffect } from 'react';
import { getRecipes, getRecipe } from '../services';
import type { Recipe } from '../types';

/**
 * Hook para cargar datos de recetas
 * Centraliza la lógica de carga de recetas
 */
export function useRecipeData(recipeId?: string) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipe = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipe(id);
      setRecipe(data);
    } catch (err) {
      setError('Error al cargar receta');
      console.error('[useRecipeData] Error loading recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipes();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar recetas');
      console.error('[useRecipeData] Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipeId) {
      loadRecipe(recipeId);
    } else {
      loadRecipes();
    }
  }, [recipeId]);

  return {
    recipe,
    recipes,
    loading,
    error,
    loadRecipe,
    loadRecipes,
  };
}
