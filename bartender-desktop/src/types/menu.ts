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

export interface GalleryImage {
  url: string;
  publicId: string;
  order: number;
}

/* =========================
   CATEGORY (NUEVO CORE)
========================= */
export interface MenuCategory {
  name: string;
  description?: string;
  image?: string;
  imagePublicId?: string;

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
  featured?: boolean;

  /* UI */
  image?: string;
  imagePublicId?: string;
  color?: string;

  /* SEO */
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];

  /* AVAILABILITY */
  availableHours?: {
    start: string;
    end: string;
  };
  availableDays?: string[];

  /* PROMOTION */
  promotedUntil?: string;

  /* PRICING */
  minPrice?: number;
  maxPrice?: number;

  /* GALLERY */
  gallery?: GalleryImage[];

  /* TAGS */
  tags?: string[];

  /* DIETARY RESTRICTIONS */
  dietaryRestrictions?: ("vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free")[];

  /* FUTURE */
  schedule?: object;

  createdAt?: string;
  updatedAt?: string;
}

/* =========================
   MENU PUBLIC (SIMPLIFICADO)
========================= */
export interface MenuPublic {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  type?: "drink" | "food" | "mixed";
  image?: string;
  color?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  categories: MenuCategory[];
}

/* =========================
   MENU CARD PUBLIC (PARA LISTAS)
========================= */
export interface MenuCardPublic {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  type?: "drink" | "food" | "mixed";
  image?: string;
  featured?: boolean;
  isPublic?: boolean;
  totalProducts?: number;
  totalCategories?: number;
}

/* =========================
   MENU FILTER
========================= */
export interface MenuFilter {
  type?: "drink" | "food" | "mixed";
  featured?: boolean;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  hideUnavailable?: boolean;
  page?: number;
  limit?: number;
}

/* =========================
   MENU ANALYTICS
========================= */
export interface MenuAnalytics {
  menuId: string;
  views: number;
  clicks: number;
  conversions: number;
  lastViewed?: string;
}
