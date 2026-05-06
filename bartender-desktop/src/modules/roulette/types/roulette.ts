export type RouletteCategory =
  | "clasico"
  | "autor"
  | "sin alcohol"
  | "shot"
  | "premium"
  | "general";

export type RouletteRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface RouletteDrink {
  _id: string;

  name: string;
  category: RouletteCategory;
  rarity: RouletteRarity;

  weight: number;
  probability?: number; 
  pityThreshold?: number;

  active: boolean;
  color: string;

  price?: number;

  totalSpins?: number;
  lastSelectedAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface RouletteSpinResult {
  result: RouletteDrink;
  meta: {
    totalOptions: number;
    totalWeight: number;
    rarity: RouletteRarity;
  };
}