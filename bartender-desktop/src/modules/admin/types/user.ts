/* =========================================================
   ROLES
========================================================= */
export type Role =
  | "admin"
  | "bartender"
  | "waiter"
  | "cashier"
  | "kitchen"
  | "client";

/* =========================================================
   SHIFT
========================================================= */
export type Shift =
  | "morning"
  | "afternoon"
  | "night"
  | "event";

/* =========================================================
   PERMISSIONS (TIPADAS )
========================================================= */
export type PermissionKey =
  | "viewEmployees"
  | "createEmployee"
  | "editEmployee"
  | "deactivateEmployee"
  | "viewDashboard"
  | "manageOrders"
  | "manageInventory"
  | "manageRecipes"
  | "accessPOS";

export type Permissions = Partial<Record<PermissionKey, boolean>>;

/* =========================================================
   SCHEDULE & AVAILABILITY
========================================================= */
export interface DaySchedule {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface UserSchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

/* =========================================================
   USER
========================================================= */
export interface User {
  _id: string;

  name: string;
  email: string;

  role: Role;

  shift?: Shift | null;

  permissions: Permissions;

  isActive: boolean;

  /** true para cualquier rol que no sea "client" */
  isEmployee?: boolean;

  /** proveedor OAuth si aplica */
  provider?: "local" | "google" | "apple" | string;

  /** avatar URL (OAuth) */
  avatar?: string | null;

  schedule?: UserSchedule;

  lastLogin?: string;

  createdAt?: string;
  updatedAt?: string;
}