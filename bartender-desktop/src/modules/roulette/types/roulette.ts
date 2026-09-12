export type RouletteCategory =
  | "clasico"
  | "autor"
  | "sin alcohol"
  | "shot"
  | "premium"
  | "general";

export type RouletteRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface RecipeIngredient {
  name:     string;
  quantity: number;
  unit:     string;
}

export interface RecipeStep {
  stepNumber:  number;
  instruction: string;
  time?:       number;
}

export interface DrinkRecipe {
  _id:        string;
  method?:    string;
  drinkStyle?: "author" | "classic";
  totalCost?: number;
  steps?:     RecipeStep[];
  ingredients: RecipeIngredient[];
}

export interface RouletteDrink {
  _id: string;

  name:     string;
  category: RouletteCategory;
  rarity:   RouletteRarity;

  weight:       number;
  probability?: number;
  pityThreshold?: number;

  active: boolean;
  color:  string;

  price?: number;

  product?: {
    _id:            string;
    name:           string;
    type?:          string;
    available?:     boolean;
    isActiveForPOS?: boolean;
    stock?:         number;
    image?:         string;
    description?:   string;
    dynamicPrice?:  number;
    recipeId?:      string;
  } | string | null;

  /** Receta adjuntada por el backend al listar */
  recipe?: DrinkRecipe | null;

  baseWeight?:      number;
  stockMultiplier?: number;
  luckMultiplier?:  number;

  totalSpins?:     number;
  totalWins?:      number;
  lastSelectedAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface RouletteSpinResult {
  result: RouletteDrink;
  meta: {
    totalOptions:  number;
    totalWeight:   number;
    rarity:        RouletteRarity;
    pityTriggered: boolean;
    kpiScore?:     number;
  };
}
