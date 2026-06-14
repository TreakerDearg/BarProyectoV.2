export interface Menu {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imagePublicId?: string;
  color: string;
  type: "drink" | "food" | "mixed";
  categories: MenuCategory[];
  active: boolean;
  isPublic: boolean;
  featured?: boolean;
  schedule: any;
  createdAt: string;
  updatedAt: string;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  // Tags
  tags?: string[];
  // Dietary restrictions
  dietaryRestrictions?: ("vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free")[];
  // Availability fields
  availableHours?: { start: string; end: string };
  availableDays?: string[];
  // Gallery
  gallery?: GalleryImage[];
  // Price range (calculated)
  minPrice?: number;
  maxPrice?: number;
  // Drink style (for drink/mixed menus)
  drinkStyle?: "author" | "classic" | "mixed";
}

export interface GalleryImage {
  url: string;
  publicId: string;
  order: number;
}

export interface MenuCategory {
  name: string;
  description: string;
  image: string;
  products: MenuProduct[];
  order: number;
}

export interface MenuProduct {
  product: string;
  price: number | null;
  available: boolean;
  featured: boolean;
  order: number;
}
