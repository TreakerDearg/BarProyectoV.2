import api from "../../../services/api";
import type { User } from "../types/user";

/* =========================================================
   HELPERS
========================================================= */
const unwrap = (res: any): any => res?.data?.data ?? res?.data ?? [];

/* =========================================================
   GET ALL USERS (con filtros opcionales)
========================================================= */
export const getUsers = async (params?: {
  role?: string;
  isEmployee?: boolean;
  active?: boolean;
  search?: string;
}): Promise<User[]> => {
  const query = new URLSearchParams();
  if (params?.role !== undefined)       query.set("role", params.role);
  if (params?.isEmployee !== undefined) query.set("isEmployee", String(params.isEmployee));
  if (params?.active !== undefined)     query.set("active", String(params.active));
  if (params?.search)                   query.set("search", params.search);
  const res = await api.get(`/users?${query.toString()}`);
  return unwrap(res);
};

/* =========================================================
   GET CLIENTS — usuarios con role="client" para promover
========================================================= */
export const getClients = async (search?: string): Promise<User[]> => {
  return getUsers({ role: "client", active: true, search });
};

/* =========================================================
   GET EMPLOYEES
========================================================= */
export const getEmployees = async (): Promise<User[]> => {
  const res = await api.get("/users/employees");
  return unwrap(res);
};

/* =========================================================
   CREATE EMPLOYEE
========================================================= */
export const createEmployee = async (payload: Partial<User> & { password?: string }) => {
  const res = await api.post("/users/employees", payload);
  return unwrap(res);
};

/* =========================================================
   PROMOTE CLIENT → EMPLOYEE
   Llama a PUT /users/:id con el nuevo rol y turno.
   El backend sincroniza isEmployee automáticamente.
========================================================= */
export const promoteToEmployee = async (
  id: string,
  role: User["role"],
  shift?: User["shift"]
): Promise<User> => {
  const payload: Partial<User> = { role };
  if (shift) payload.shift = shift;
  const res = await api.put(`/users/${id}`, payload);
  return unwrap(res);
};

/* =========================================================
   UPDATE USER
========================================================= */
export const updateUser = async (id: string, payload: Partial<User>) => {
  const res = await api.put(`/users/${id}`, payload);
  return unwrap(res);
};

/* =========================================================
   DEACTIVATE
========================================================= */
export const deactivateUser = async (id: string) => {
  const res = await api.patch(`/users/${id}/deactivate`);
  return unwrap(res);
};

/* =========================================================
   ACTIVATE
========================================================= */
export const activateUser = async (id: string) => {
  const res = await api.patch(`/users/${id}/activate`);
  return unwrap(res);
};

/* =========================================================
   CHANGE PASSWORD
========================================================= */
export const changePassword = async (id: string, password: string) => {
  const res = await api.patch(`/users/${id}/password`, { password });
  return unwrap(res);
};

/* =========================================================
   GET BY ID
========================================================= */
export const getUserById = async (id: string): Promise<User | null> => {
  const res = await api.get(`/users/${id}`);
  return unwrap(res);
};

/* =========================================================
   UPDATE ROLE PERMISSIONS
========================================================= */
export const updateRolePermissions = async (role: string, permissions: Record<string, boolean>) => {
  const res = await api.patch(`/users/role/${role}/permissions`, { permissions });
  return unwrap(res);
};

/* =========================================================
   UPDATE SHIFT PERMISSIONS
========================================================= */
export const updateShiftPermissions = async (shift: string, permissions: Record<string, boolean>) => {
  const res = await api.patch(`/users/shift/${shift}/permissions`, { permissions });
  return unwrap(res);
};