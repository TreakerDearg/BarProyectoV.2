export type RouletteCategory =
  | "clasico"
  | "autor"
  | "sin alcohol"
  | "shot"
  | "premium"
  | "general";

export interface RouletteDrink {
  _id: string;

  name: string;
  category: RouletteCategory;

  weight: number;
  probability?: number; // calculado por backend

  active: boolean;
  color: string;

  price?: number;

  totalSpins?: number;
  lastSelectedAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

/* ==============================
   SPIN RESULT
============================== */
export interface RouletteSpinResult {
  result: RouletteDrink;
  meta: {
    totalOptions: number;
    totalWeight: number;
  };
}