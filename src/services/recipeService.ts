const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const RECIPES_API = `${API_URL}/recipes`;

/* ================================
   TYPES NORMALIZADOS (CRÍTICO)
================================ */

export interface RecipeIngredient {
  ingredientId:
    | string
    | {
        _id: string;
        name: string;
        unit?: string;
      };
  quantity: number;
}

export interface Recipe {
  _id: string;

  productId:
    | string
    | {
        _id: string;
        name: string;
        category?: string;
        image?: string;
      };

  ingredients: RecipeIngredient[];

  instructions?: string;
  image?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeDTO {
  productId: string;
  ingredients: {
    ingredientId: string;
    quantity: number;
  }[];
  instructions?: string;
  image?: string;
}

/* ================================
   FETCH BASE
================================ */
const fetchAPI = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }

  if (res.status === 204) return {} as T;

  return res.json();
};

/* ================================
   NORMALIZER SAFE GET
================================ */
const safeArray = <T,>(data: any): T[] =>
  Array.isArray(data) ? data : [];

/* ================================
   SERVICES
================================ */

export const getRecipes = async (): Promise<Recipe[]> => {
  const data = await fetchAPI<Recipe[]>(RECIPES_API, {
    cache: "no-store",
  });

  return safeArray<Recipe>(data);
};

export const getRecipeById = async (id: string) => {
  return fetchAPI<Recipe>(`${RECIPES_API}/${id}`);
};

export const createRecipe = async (data: RecipeDTO) => {
  return fetchAPI<Recipe>(RECIPES_API, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateRecipe = async (
  id: string,
  data: Partial<RecipeDTO>
) => {
  return fetchAPI<Recipe>(`${RECIPES_API}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteRecipe = async (id: string) => {
  await fetchAPI(`${RECIPES_API}/${id}`, {
    method: "DELETE",
  });
};