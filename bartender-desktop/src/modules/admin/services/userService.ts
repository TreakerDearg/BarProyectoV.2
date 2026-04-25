import api from "../../../services/api";
import type { User } from "../types/user";

/* =========================================================
   HELPERS
========================================================= */
const unwrap = (res: any) => res?.data?.data ?? res?.data ?? [];

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
export const createEmployee = async (payload: Partial<User>) => {
  const res = await api.post("/users/employees", payload);
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