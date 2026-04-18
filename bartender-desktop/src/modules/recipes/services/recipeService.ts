import api from "../../../services/api";
import type { Recipe } from "../types/recipe";

/* =========================
   NORMALIZER (BACKEND MATCH)
========================= */
const normalizeRecipe = (r: Recipe) => ({
  product: r.product,

  type: r.type,
  method: r.method ?? "",
  category: r.category ?? "general",
  image: r.image ?? "",

  ingredients: Array.isArray(r.ingredients)
    ? r.ingredients.map((i) => ({
        inventoryItem: i.inventoryItem,
        quantity: Number(i.quantity),
        unit: i.unit,
        order: i.order ?? 0,
      }))
    : [],

  steps: Array.isArray(r.steps)
    ? r.steps.map((s, index) => ({
        stepNumber: s.stepNumber ?? index + 1,
        instruction: s.instruction,
      }))
    : [],
});

/* =========================
   GET ALL RECIPES
========================= */
export const getRecipes = async (): Promise<Recipe[]> => {
  const { data } = await api.get("/recipes");
  return Array.isArray(data) ? data : [];
};

/* =========================
   GET ONE RECIPE
========================= */
export const getRecipe = async (id: string): Promise<Recipe> => {
  const { data } = await api.get(`/recipes/${id}`);
  return data;
};

/* =========================
   CREATE RECIPE
========================= */
export const createRecipe = async (recipe: Recipe) => {
  const payload = normalizeRecipe(recipe);

  const { data } = await api.post("/recipes", payload);
  return data;
};

/* =========================
   UPDATE RECIPE (PUT = BACKEND)
========================= */
export const updateRecipe = async (id: string, recipe: Recipe) => {
  const payload = normalizeRecipe(recipe);

  const { data } = await api.put(`/recipes/${id}`, payload);
  return data;
};

/* =========================
   DELETE RECIPE
========================= */
export const deleteRecipe = async (id: string) => {
  await api.delete(`/recipes/${id}`);
};

/* =========================
   PROTOCOL (BARTENDER UI)
========================= */
export const getRecipeProtocol = async (id: string) => {
  const { data } = await api.get(`/recipes/${id}/protocol`);
  return data;
};

/* =========================
   AVAILABILITY CHECK
========================= */
export const checkRecipeAvailability = async (id: string) => {
  const { data } = await api.get(`/recipes/${id}/availability`);
  return data;
};

/* =========================
   BY PRODUCT
========================= */
export const getRecipesByProduct = async (productId: string) => {
  const { data } = await api.get(`/recipes/product/${productId}`);
  return data;
};