export interface RecipeIngredient {
  inventoryItem: {
    _id: string;
    name: string;
  };
  quantity: number;
  unit: "ml" | "l" | "g" | "kg" | "unit" | "oz" | "portion";
  order?: number;
  baseUnitMultiplier?: number;
}

export interface IngredientWithStock extends RecipeIngredient {
  inventoryItem: {
    _id: string;
    name: string;
    stock: number;
    cost: number;
    unit: string;
  };
  available: boolean;
  totalIngredientCost: number;
}
