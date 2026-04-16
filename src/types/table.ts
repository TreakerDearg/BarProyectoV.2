export type TableLocation = "indoor" | "outdoor" | "bar";
export type TableStatus = "available" | "reserved" | "occupied";

export interface Table {
  _id: string;
  number: number;
  capacity: number;
  location: TableLocation;
  status?: TableStatus;
  createdAt?: string;
  updatedAt?: string;
}