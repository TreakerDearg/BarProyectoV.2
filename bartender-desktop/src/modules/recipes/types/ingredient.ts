export interface RecipeIngredient {
  inventoryItem: {
    _id: string;
    name: string;
    cost?: number;
    stock?: number;
    unit?: string;
    provider?: string;
    type?: string;
    category?: string;
    isAvailable?: boolean;
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
