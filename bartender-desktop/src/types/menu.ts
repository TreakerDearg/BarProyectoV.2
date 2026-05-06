export interface MenuProduct {
  product: string; // ProductId

  /* UI */
  featured?: boolean;
  position?: number;

  /* Overrides */
  customPrice?: number;
  available?: boolean;
}

/* =========================
   CATEGORY (NUEVO CORE)
========================= */
export interface MenuCategory {
  name: string;
  description?: string;

  position?: number;

  products: MenuProduct[];
}

/* =========================
   MENU
========================= */
export interface Menu {
  _id?: string;

  name: string;
  description?: string;

  type?: "bar" | "kitchen";

  categories: MenuCategory[];

  /* STATUS */
  active: boolean;
  isPublic?: boolean;

  /* UI */
  image?: string;
  color?: string;

  createdAt?: string;
  updatedAt?: string;
}