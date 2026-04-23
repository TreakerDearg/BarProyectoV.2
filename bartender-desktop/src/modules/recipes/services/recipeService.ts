import api from "../../../services/api";
import type { Recipe } from "../types/recipe";

/* =========================
   NORMALIZER (FULL SAFE)
========================= */
const normalizeRecipe = (r: Recipe) => ({
  product:
    typeof r.product === "string"
      ? r.product
      : r.product?._id,

  type: r.type || "drink",
  method: r.method || "",
  category: r.category || "general",
  image: r.image || "",

  ingredients: Array.isArray(r.ingredients)
    ? r.ingredients
        .filter((i) => i.inventoryItem && i.quantity > 0)
        .map((i) => ({
          inventoryItem:
            typeof i.inventoryItem === "string"
              ? i.inventoryItem
              : i.inventoryItem._id,

          quantity: Number(i.quantity),
          unit: i.unit || "ml",
          order: i.order ?? 0,
        }))
    : [],

  steps: Array.isArray(r.steps)
    ? r.steps.map((s, index) => ({
        stepNumber: s.stepNumber || index + 1,
        instruction: s.instruction || "",
      }))
    : [],
});

/* =========================
   GET ALL
========================= */
export const getRecipes = async (): Promise<Recipe[]> => {
  const { data } = await api.get("/recipes");
  return data || [];
};

/* =========================
   GET ONE
========================= */
export const getRecipe = async (id: string): Promise<Recipe> => {
  const { data } = await api.get(`/recipes/${id}`);
  return data;
};

/* =========================
   CREATE
========================= */
export const createRecipe = async (recipe: Recipe) => {
  try {
    const payload = normalizeRecipe(recipe);

    const { data } = await api.post("/recipes", payload);
    return data;
  } catch (error: any) {
    console.error("CREATE_RECIPE_ERROR:", error?.response?.data || error.message);
    throw error;
  }
};

/* =========================
   UPDATE
========================= */
export const updateRecipe = async (id: string, recipe: Recipe) => {
  try {
    const payload = normalizeRecipe(recipe);

    const { data } = await api.patch(`/recipes/${id}`, payload);
    return data;
  } catch (error: any) {
    console.error("UPDATE_RECIPE_ERROR:", error?.response?.data || error.message);
    throw error;
  }
};

/* =========================
   DELETE
========================= */
export const deleteRecipe = async (id: string) => {
  try {
    await api.delete(`/recipes/${id}`);
  } catch (error: any) {
    console.error("DELETE_RECIPE_ERROR:", error?.response?.data || error.message);
    throw error;
  }
};

/* =========================
   PROTOCOL (BARTENDER VIEW)
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