export interface Product {
  _id: string;
  name: string;
  price?: number;
  category?: string;
}

export interface Menu {
  _id: string;
  name: string;
  products: Product[];
  createdAt?: string;
  updatedAt?: string;
}