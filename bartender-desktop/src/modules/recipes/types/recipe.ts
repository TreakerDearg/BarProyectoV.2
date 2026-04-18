export interface RecipeIngredient {
  inventoryItem: {
    _id: string;
    name: string;
  };
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

  product: {
    _id: string;
    name: string;
  };

  ingredients: RecipeIngredient[];

  type: "drink" | "food";

  method?: string;

  steps?: RecipeStep[];

  category: string;

  image?: string;

  totalCost?: number;

  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
}