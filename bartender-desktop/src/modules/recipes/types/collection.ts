export interface RecipeCollection {
  _id?: string;
  name: string;
  icon: string;
  description?: string;
  color?: string;
  tags: string[];
  recipeCount: number;
  isSystem?: boolean;
  createdAt?: string;
}

export interface RecipeTag {
  _id?: string;
  name: string;
  category: 'author' | 'premium' | 'season' | 'event' | 'style' | 'speed' | 'popularity' | 'margin' | 'stock';
  color?: string;
  usageCount?: number;
}
