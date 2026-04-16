export type TableStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "maintenance";

export interface Table {
  _id?: string;
  number: number;
  capacity: number;
  status: TableStatus;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}