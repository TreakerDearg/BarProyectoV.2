export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface Reservation {
  _id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  guests: number;
  tableNumber: number;
  status: ReservationStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}