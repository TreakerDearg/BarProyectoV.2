export interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: "available" | "reserved" | "occupied";
}

export interface Reservation {
  _id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  guests: number;
  tableId: Table;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt?: string;
  updatedAt?: string;
}