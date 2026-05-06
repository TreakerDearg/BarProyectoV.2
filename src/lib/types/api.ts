import { Key, ReactNode } from "react";

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

export type ProductBrief = {
  description: ReactNode;
  _id: string;
  name: string;
  price?: number;
  type?: string;
  image?: string;
  available?: boolean;
  dynamicPrice?: number;
};

export type CartLine = {
  productId: string;
  name: string;
  quantity: number;
  notes: string;
};

export type MenuCategory = {
  _id: Key | null | undefined;
  name: string;
  products: Array<{
    available?: boolean;
    product?: ProductBrief | null;
  }>;
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
