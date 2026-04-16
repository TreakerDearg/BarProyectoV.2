export interface RecipeIngredient {
  inventoryItem: string;
  quantity: number;
}

export interface Recipe {
  _id?: string;
  product: string;
  ingredients: RecipeIngredient[];
  instructions?: string;
  createdAt?: string;
  updatedAt?: string;
}