import { api } from "../../../services/api";

export const getRecipes = async () => {
  const { data } = await api.get("/recipes");
  return data;
};

export const createRecipe = async (recipe: any) => {
  const { data } = await api.post("/recipes", recipe);
  return data;
};

export const deleteRecipe = async (id: string) => {
  await api.delete(`/recipes/${id}`);
};