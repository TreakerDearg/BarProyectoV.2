export interface RecipeIngredient {
  inventoryItem: string;
  quantity: number;
  unit: "ml" | "l" | "g" | "kg" | "unit" | "oz" | "portion";
  order?: number;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
}

export interface Recipe {
  _id?: string;

  /* =========================
     RELATION
  ========================= */
  product: string;

  /* =========================
     CORE DATA
  ========================= */
  type: "drink" | "food";
  category?: string;

  method?: string;
  image?: string;

  /* =========================
     CONTENT
  ========================= */
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];

  /* =========================
     SYSTEM
  ========================= */
  totalCost?: number;
  isActive?: boolean;

  /* =========================
     TIMESTAMPS
  ========================= */
  createdAt?: string;
  updatedAt?: string;
}