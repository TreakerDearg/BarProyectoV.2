export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  subcategory?: string;
  type: "drink" | "food";
  drinkStyle?: "author" | "classic";
  image?: string;
  available: boolean;
  featured: boolean;
  tags: string[];
  dietaryRestrictions: ("vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free")[];
  preparationTime: number;
  dynamicPrice?: number;
  createdAt?: string;
  updatedAt?: string;
  hasRecipe?: boolean;
  recipeId?: string;
  recipe?: any;
  menuIds?: string[];
}