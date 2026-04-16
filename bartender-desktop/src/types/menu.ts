export interface Menu {
  _id?: string;
  name: string;
  description: string;
  category: string;
  products: string[];
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}