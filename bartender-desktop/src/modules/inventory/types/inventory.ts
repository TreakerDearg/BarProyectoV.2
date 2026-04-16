export interface InventoryItem {
  _id?: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  cost: number;
  supplier?: string;
  createdAt?: string;
  updatedAt?: string;
}