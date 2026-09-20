export interface ProductRecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface ProductRecipe {
  _id?: string;
  name?: string;
  ingredients?: ProductRecipeIngredient[];
  instructions?: string[];
  preparationTime?: number;
}
