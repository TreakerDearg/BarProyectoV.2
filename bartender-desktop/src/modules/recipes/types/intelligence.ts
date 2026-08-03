// Health Score
export interface RecipeHealthScore {
  overall: number;
  cost: number;
  availability: number;
  time: number;
  complexity: number;
  profitability: number;
  consistency: number;
  presentation: number;
  production: number;
}

// Formula Intelligence
export interface FormulaAnalysis {
  balance: number;
  cost: number;
  difficulty: number;
  time: number;
  availability: number;
  margin: number;
  waste: number;
  reusability: number;
  consistency: number;
  issues: FormulaIssue[];
  suggestions: FormulaSuggestion[];
}

export interface FormulaIssue {
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high';
  field?: string;
}

export interface FormulaSuggestion {
  type: 'ingredient' | 'technique' | 'decoration' | 'cost' | 'production' | 'presentation' | 'stock' | 'margin' | 'complexity';
  message: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

// Production Analysis
export interface ProductionAnalysis {
  totalTime: number;
  difficulty: 'low' | 'medium' | 'high';
  utensils: number;
  cost: number;
  margin: number;
  difficultIngredients: string[];
  expensiveIngredients: string[];
  longPreparations: string[];
  glassChanges: number;
  techniqueChanges: number;
  stepCount: number;
}

// Waste Analysis
export interface WasteAnalysis {
  totalWaste: number;
  wasteItems: WasteItem[];
  suggestions: WasteSuggestion[];
}

export interface WasteItem {
  ingredient: string;
  used: number;
  available: number;
  wastePercentage: number;
  unit: string;
}

export interface WasteSuggestion {
  message: string;
  action: string;
  potentialSavings: number;
}

// Recipe Relations
export interface RecipeRelation {
  recipeId: string;
  recipeName: string;
  relationType: 'variant' | 'similar' | 'family' | 'ingredient' | 'technique';
  similarity: number;
}

// Recipe Similarity
export interface RecipeSimilarity {
  recipeId: string;
  recipeName: string;
  similarity: number;
  commonIngredients: string[];
  commonTechniques: string[];
  differences: string[];
}

// Smart Ingredient Analysis
export interface IngredientAnalysis {
  ingredientId: string;
  name: string;
  usedByRecipes: number;
  averageCost: number;
  stock: number;
  stockStatus: 'normal' | 'low' | 'critical';
  supplier: string;
  popularity: 'low' | 'medium' | 'high';
  category: string;
}

// Recipe Timeline
export interface RecipeTimelineEvent {
  id: string;
  date: string;
  type: 'created' | 'ingredient_added' | 'ingredient_removed' | 'cost_changed' | 'variant_created' | 'product_associated' | 'version_created';
  description: string;
  author: string;
  details?: any;
}

// Recipe Warnings
export interface RecipeWarning {
  id: string;
  type: 'stock_insufficient' | 'high_cost' | 'product_without_recipe' | 'recipe_without_image' | 'ingredient_discontinued' | 'cost_outdated' | 'supplier_missing' | 'variant_without_parent';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
  field?: string;
}

// Recipe Analytics Mini
export interface RecipeAnalyticsMini {
  popularity: number;
  margin: number;
  cost: number;
  time: number;
  complexity: 'low' | 'medium' | 'high';
  ingredientCount: number;
  variantCount: number;
  productCount: number;
}
