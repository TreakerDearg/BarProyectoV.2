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

  lastLogin?: string;

  createdAt?: string;
  updatedAt?: string;
}