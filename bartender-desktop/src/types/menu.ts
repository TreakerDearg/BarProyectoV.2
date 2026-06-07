export interface MenuProduct {
  product: string; // ProductId

  /* UI */
  featured?: boolean;
  order?: number;

  /* Overrides */
  price?: number;
  available?: boolean;

  /* Recipe & Inventory Info */
  hasRecipe?: boolean;
  missingIngredients?: Array<{
    name: string;
    required: number;
    available: number;
    unit: string;
  }>;
}

/* =========================
   CATEGORY (NUEVO CORE)
========================= */
export interface MenuCategory {
  name: string;
  description?: string;

  order?: number;

  products: MenuProduct[];
}

/* =========================
   MENU
========================= */
export interface Menu {
  _id?: string;

  name: string;
  description?: string;
  slug?: string;

  type?: "drink" | "food" | "mixed";

  drinkStyle?: "author" | "classic" | "mixed";

  categories: MenuCategory[];

  /* STATUS */
  active: boolean;
  isPublic?: boolean;

  /* UI */
  image?: string;
  color?: string;

  /* FUTURE */
  schedule?: object;

  createdAt?: string;
  updatedAt?: string;
}
