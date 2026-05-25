export type TableStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "maintenance";

export type TableLocation = "indoor" | "outdoor" | "bar";

/* =========================
   TAGS
========================= */
export interface TableTag {
  label: string;
  type: "allergy" | "diet" | "preference" | "warning" | "other";
  priority: "low" | "medium" | "high";
}

/* =========================
   ORDER MINIMAL (for table view)
========================= */
export interface TableOrder {
  _id: string;
  total: number;
  status: string;
  sessionStatus: "open" | "closed";
}

/* =========================
   TABLE (FIXED POS MODEL FRONT)
========================= */
export interface Table {
  _id: string;

  number: number;
  capacity: number;

  status: TableStatus;
  location: TableLocation;

  /* SPATIAL INFO */
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "circle" | "square";


  orders: TableOrder[];

  openedAt?: string | null;
  closedAt?: string | null;

  currentSessionId?: string | null;
  currentReservation?: string | null;
  reservationStart?: string | null;
  reservationEnd?: string | null;

  notes?: string;

  tags: TableTag[];

  createdAt?: string;
  updatedAt?: string;

  /* virtual backend */
  activeTime?: number;

  /* PAYMENT TRACKING */
  totalPayments?: number;
  lastPaymentAt?: string | null;
}