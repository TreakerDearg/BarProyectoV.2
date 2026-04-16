export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "bartender" | "waiter" | "cashier" | "client";
  isActive: boolean;
}