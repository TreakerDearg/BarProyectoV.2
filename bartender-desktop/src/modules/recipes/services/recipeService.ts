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

/* =========================
   DASHBOARD STATS
========================= */
export const getDashboardStats = async () => {
  const { data } = await api.get("/recipes/dashboard/stats");
  return data as {
    stats: {
      totalRecipes: number;
      primaryRecipes: number;
      variantRecipes: number;
      drinkRecipes: number;
      foodRecipes: number;
      avgCost: number;
      avgMargin: number;
      categoryCounts: Record<string, number>;
      totalBeverages: number;
      beveragesWithRecipe: number;
      beveragesWithoutRecipe: number;
      coveragePercentage: number;
    };
  };
};

/* =========================
   DASHBOARD RECENT
========================= */
export const getDashboardRecent = async (limit = 10) => {
  const { data } = await api.get(`/recipes/dashboard/recent?limit=${limit}`);
  return data as Array<{
    _id: string;
    name: string;
    image: string;
    category: string;
    type: string;
    price: number;
    totalCost: number;
    margin: number;
    createdAt: string;
  }>;
};

/* =========================
   DASHBOARD WARNINGS
========================= */
export const getDashboardWarnings = async () => {
  const { data } = await api.get("/recipes/dashboard/warnings");
  return data as Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
    count: number;
    items: any[];
  }>;
};

/* =========================
   DASHBOARD SUGGESTIONS
========================= */
export const getDashboardSuggestions = async () => {
  const { data } = await api.get("/recipes/dashboard/suggestions");
  return data as Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    recipeId?: string;
    recipeName?: string;
  }>;
};

/* =========================
   RECIPE ANALYTICS
========================= */
export const getRecipeAnalytics = async (id: string) => {
  const { data } = await api.get(`/recipes/analytics/${id}`);
  return data;
};

/* =========================
   RECIPE TIMELINE (de backend)
========================= */
export const getRecipeTimeline = async (id: string) => {
  const { data } = await api.get(`/recipes/${id}/timeline`);
  return data as Array<{
    _id: string;
    version: string;
    type: string;
    date: string;
    author: string;
    description: string;
    changes: string[];
  }>;
};

/* =========================
   RECIPE LOGS (activity)
========================= */
export const getRecipeLogs = async (params?: {
  limit?: number;
  page?: number;
  recipeId?: string;
}) => {
  const qs = new URLSearchParams();
  if (params?.limit)    qs.set("limit",    String(params.limit));
  if (params?.page)     qs.set("page",     String(params.page));
  if (params?.recipeId) qs.set("recipeId", params.recipeId);
  const { data } = await api.get(`/recipes/dashboard/logs?${qs.toString()}`);
  return data as {
    data: Array<{
      _id: string;
      activityType: string;
      description: string;
      userName: string;
      userRole: string;
      userAvatar: string | null;
      recipeId: string | null;
      metadata: Record<string, any>;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  };
};
