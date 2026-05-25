export interface Menu {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  color: string;
  type: "drink" | "food" | "mixed";
  categories: MenuCategory[];
  active: boolean;
  isPublic: boolean;
  schedule: any;
  createdAt: string;
  updatedAt: string;
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
