import { api } from "../../../services/api";
import type { Recipe } from "../types/recipe";

export const getRecipes = async (): Promise<Recipe[]> => {
  const { data } = await api.get("/recipes");
  return data;
};

export const createRecipe = async (
  recipe: Recipe
): Promise<Recipe> => {
  const { data } = await api.post("/recipes", recipe);
  return data;
};

export const updateRecipe = async (
  id: string,
  recipe: Recipe
): Promise<Recipe> => {
  const { data } = await api.put(`/recipes/${id}`, recipe);
  return data;
};

export const deleteRecipe = async (
  id: string
): Promise<void> => {
  await api.delete(`/recipes/${id}`);
};