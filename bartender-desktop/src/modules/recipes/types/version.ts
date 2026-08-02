export interface RecipeVersion {
  version: string;
  date: string;
  author: string;
  changes: string[];
  notes?: string;
  variantId?: string;
}

export interface RecipeHistoryItem {
  id: string;
  date: string;
  action: string;
  author: string;
  details: string;
  recipeId: string;
  variantId?: string;
}
