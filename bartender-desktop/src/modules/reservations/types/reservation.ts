export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no-show";

export type ReservationSource = "web" | "app" | "admin";

export type TagType = "allergy" | "diet" | "preference" | "vip" | "other";

export type TagPriority = "low" | "medium" | "high";

export interface ReservationTag {
  label: string;
  type: TagType;
  priority: TagPriority;
}

export interface Reservation {
  _id?: string;

  customerName: string;
  customerPhone: string;
  customerEmail?: string;

  startTime: string; // ISO
  endTime: string;   // ISO

  dayKey?: string;
  timeSlot?: string;

  guests: number;

  tableId?: {
    _id: string;
    number: number;
    capacity: number;
    status: string;
    location: string;
  } | string | null;

  status: ReservationStatus;

  isVIP?: boolean;
  deposit?: number;

  posSessionId?: string;

  notes?: string;
  tags?: ReservationTag[];

  source?: ReservationSource;

  isLocked?: boolean;

  seatedAt?: string;
  cancelledAt?: string;

  isActive?: boolean;
  durationMinutes?: number;

  createdAt?: string;
  updatedAt?: string;
}