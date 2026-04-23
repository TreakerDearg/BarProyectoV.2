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


  orders: TableOrder[];

  openedAt?: string | null;
  closedAt?: string | null;

  currentSessionId?: string | null;
  currentReservation?: string | null;

  notes?: string;

  tags: TableTag[];

  createdAt?: string;
  updatedAt?: string;

  /* virtual backend */
  activeTime?: number;
}