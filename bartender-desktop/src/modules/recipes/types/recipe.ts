import type { RecipeIngredient } from './ingredient';
import type { RecipeStep } from './step';

export interface Recipe {
  _id?: string;

  product: {
    _id: string;
    name: string;
    type?: "drink" | "food";
    price?: number;
  };

  ingredients: RecipeIngredient[];

  type: "drink" | "food";

  drinkStyle?: "author" | "classic";

  method?: string;

  steps?: RecipeStep[];

  category: string;

  image?: string;
  imagePublicId?: string;

  totalCost?: number;

  isActive?: boolean;

  // Recipe Master & Variants
  isPrimary?: boolean;
  variantName?: string;
  parentId?: string;
  inheritanceSettings?: InheritanceSettings;

  specifications?: {
    glass?: string;
    ice?: string;
  };

  // Metadata for Recipe Library
  version?: number;
  popularity?: number;
  author?: string;
  tags?: string[];
  collections?: string[];
  isFavorite?: boolean;
  techniqueId?: string;
  decorationIds?: string[];

  // Versioning
  currentVersion?: RecipeVersion;
  versionHistory?: RecipeVersion[];

  createdAt?: string;
  updatedAt?: string;
}

export interface InheritanceSettings {
  inheritIngredients: boolean;
  inheritSteps: boolean;
  inheritMethod: boolean;
  inheritSpecifications: boolean;
  inheritCategory: boolean;
  inheritDrinkStyle: boolean;
}

export interface RecipeVariant {
  _id: string;
  variantName: string;
  isPrimary: boolean;
  parentId?: string;
  recipe: Recipe;
}

export interface RecipeTree {
  master: Recipe;
  variants: RecipeVariant[];
  depth: number;
}

// Recipe Versioning
export interface RecipeVersion {
  version: string;
  date: string;
  author: string;
  changes: string[];
  notes?: string;
  variantId?: string;
}

// Collections
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

// Tags
export interface RecipeTag {
  _id?: string;
  name: string;
  category: 'author' | 'premium' | 'season' | 'event' | 'style' | 'speed' | 'popularity' | 'margin' | 'stock';
  color?: string;
  usageCount?: number;
}

// Techniques
export interface Technique {
  _id?: string;
  name: string;
  description: string;
  category: 'shake' | 'stir' | 'build' | 'blend' | 'smoke' | 'layer' | 'roll' | 'muddle' | 'strain';
  icon?: string;
  instructions?: string;
  equipment?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  time?: number;
}

// Decorations
export interface Decoration {
  _id?: string;
  name: string;
  type: 'garnish' | 'glassware' | 'presentation' | 'aroma' | 'ice';
  description?: string;
  image?: string;
  icon?: string;
  category?: string;
  cost?: number;
}

// History
export interface RecipeHistoryItem {
  id: string;
  date: string;
  action: string;
  author: string;
  details: string;
  recipeId: string;
  variantId?: string;
}

// Comparison
export interface RecipeComparison {
  recipeA: Recipe;
  recipeB: Recipe;
  ingredientDifferences: IngredientDifference[];
  costDifference: number;
  stepDifferences: StepDifference[];
  complexityDifference: number;
}

export interface IngredientDifference {
  ingredient: string;
  quantityA: number;
  quantityB: number;
  unit: string;
  costA: number;
  costB: number;
}

export interface StepDifference {
  stepNumber: number;
  instructionA: string;
  instructionB: string;
}

// Search
export interface RecipeSearchQuery {
  query?: string;
  ingredient?: string;
  product?: string;
  category?: string;
  collection?: string;
  technique?: string;
  decoration?: string;
  tag?: string;
  author?: string;
  version?: string;
  minCost?: number;
  maxCost?: number;
}