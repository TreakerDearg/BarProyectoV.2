export type Role =
  | "admin"
  | "bartender"
  | "waiter"
  | "cashier"
  | "kitchen"
  | "client";

export type Shift = "morning" | "afternoon" | "night" | "event";

export type Permissions = Record<string, boolean>;

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