export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}