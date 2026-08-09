import api from "../../../services/api";
import type { Recipe } from "../types/recipe";

/* =========================
   IMAGE VALIDATION
========================= */
export function validateImageData(recipe: any): { valid: boolean; error?: string } {
  // If image URL is provided, publicId must also be provided
  if (recipe.image && !recipe.imagePublicId) {
    return {
      valid: false,
      error: 'Se requiere imagePublicId cuando se proporciona una imagen'
    };
  }

  // If publicId is provided, image URL must also be provided
  if (recipe.imagePublicId && !recipe.image) {
    return {
      valid: false,
      error: 'Se requiere image URL cuando se proporciona imagePublicId'
    };
  }

  // Validate Cloudinary URL format (basic check)
  if (recipe.image && !recipe.image.includes('cloudinary.com')) {
    return {
      valid: false,
      error: 'La URL de la imagen debe ser de Cloudinary'
    };
  }

  return { valid: true };
}

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
  imagePublicId: r.imagePublicId || "",

  // Variant fields
  isPrimary: r.isPrimary !== undefined ? r.isPrimary : true,
  variantName: r.variantName || "",
  parentId: r.parentId || null,

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
          baseUnitMultiplier: i.baseUnitMultiplier || 1,
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
    // Validate image data before sending
    const imageValidation = validateImageData(recipe);
    if (!imageValidation.valid) {
      throw new Error(imageValidation.error);
    }

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
    // Validate image data before sending
    const imageValidation = validateImageData(recipe);
    if (!imageValidation.valid) {
      throw new Error(imageValidation.error);
    }

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

/* =========================
   DRINK PRODUCTS WITH RECIPES AND VARIANTS
========================= */
export const getDrinkProductsWithRecipes = async (params?: { category?: string; available?: boolean }) => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.available !== undefined) queryParams.append('available', params.available.toString());
  
  const url = `/recipes/drinks/with-recipes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const { data } = await api.get(url);
  return data;
};

/* =========================
   GET ALL RECIPES (for Recipe Library)
========================= */
export const getRecipes = async (params?: { type?: string; category?: string }): Promise<Recipe[]> => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.category) queryParams.append('category', params.category);
  
  const url = `/recipes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const { data } = await api.get(url);
  return Array.isArray(data) ? data : [];
};

/* =========================
   CREATE VARIANT FROM RECIPE
========================= */
export const createRecipeVariant = async (parentRecipeId: string, payload: { productId: string; variantName?: string }): Promise<Recipe> => {
  try {
    const { data } = await api.post(`/recipes/${parentRecipeId}/variants`, payload);
    return data;
  } catch (error: any) {
    console.error("CREATE_VARIANT_ERROR:", error?.response?.data || error.message);
    throw error;
  }
};