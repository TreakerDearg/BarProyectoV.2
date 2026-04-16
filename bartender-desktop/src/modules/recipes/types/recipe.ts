export interface RecipeIngredient {
  inventoryItem: {
    _id: string;
    name: string;
  };
  quantity: number;
}

export interface Recipe {
  _id?: string;
  product: {
    _id: string;
    name: string;
  };
  ingredients: RecipeIngredient[];
}