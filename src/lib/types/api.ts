export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorBody = {
  success?: false;
  message?: string;
};

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

// ========== DTOs Públicos ==========
// Contratos normalizados entre backend y frontend

export type ProductPublicDTO = {
  id: string;
  name: string;
  description: string;
  price: number;
  dynamicPrice: number;
  image: string;
  type: "drink" | "food";
  drinkStyle: "author" | "classic";
  available: boolean;
  featured: boolean;
  category: string;
  tags: string[];
  dietaryRestrictions: DietaryRestriction[];
};

export type DietaryRestriction = "vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free";

export type MenuPublicDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  type: "drink" | "food" | "mixed";
  drinkStyle: "author" | "classic" | "mixed";
  featured: boolean;
  minPrice: number;
  maxPrice: number;
  categories: MenuCategoryPublicDTO[];
};

export type MenuCategoryPublicDTO = {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
  products: MenuProductPublicDTO[];
};

export type MenuProductPublicDTO = {
  product: ProductPublicDTO;
  price: number | null;
  available: boolean;
  featured: boolean;
  order: number;
};

export type TablePublicDTO = {
  id: string;
  number: number;
  capacity: number;
  location: "indoor" | "outdoor" | "bar";
  status: TableStatus;
  currentSessionId: string | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  shape?: string;
};

export type TableStatus = "available" | "reserved" | "occupied" | "maintenance";

// ========== Legacy Types (para migración gradual) ==========
// ProductBrief se mantiene temporalmente para compatibilidad
// TODO: Migrar todos los consumidores a ProductPublicDTO

export type ProductBrief = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  type?: string;
  image?: string;
  available?: boolean;
  dynamicPrice?: number;
};

export type MenuCategory = {
  _id: string;
  name: string;

  products: Array<{
    available?: boolean;
    product?: ProductBrief | null;
  }>;
};

export type CartLine = {
  productId: string;
  name: string;
  quantity: number;
  notes: string;
  price: number;
};

export type PublicMenu = {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  categories: MenuCategory[];
};

export type TableRow = {
  _id: string;
  number: number;
  capacity: number;
  status: string;
  location?: string;
  currentSessionId?: string | null;
};

export type RouletteDrinkRow = {
  _id: string;
  name: string;
  weight: number;
  color?: string;
  rarity?: string;
  probability?: number;
  active?: boolean;
  product?: ProductBrief | null;
};

export type PromotionPublicDTO = {
  id: string;
  name: string;
  description: string;
  type: string;
  value: number;
  applicableProducts: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    available: boolean;
  }>;
  applicableCategories: string[];
  schedule: {
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    startDate: Date;
    endDate: Date;
  } | null;
  active: boolean;
};

export type OrderResponse = {
  _id: string;
  status: string;
  table: string;
  sessionId: string;
  items: any[];
  total: number;
  createdAt: string;
};
