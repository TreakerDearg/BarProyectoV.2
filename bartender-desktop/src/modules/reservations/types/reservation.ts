export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no-show";

export interface Reservation {
  _id?: string;

  customerName: string;
  customerPhone: string;

  startTime: string; // ISO
  endTime: string;   // ISO

  guests: number;

  tableId: {
    _id: string;
    number: number;
  } | string;

  status: ReservationStatus;

  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}