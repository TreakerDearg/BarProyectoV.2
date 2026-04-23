import api from "../../../services/api";
import type { User, Shift } from "../types/user";

/* =========================================================
    NORMALIZADOR GLOBAL DE RESPUESTAS
   (evita crashes por backend inconsistente)
========================================================= */
const unwrap = (response: any) => {
  const data = response?.data;

  // casos comunes de backend
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;

  return data;
};

/* =========================================================
    GET EMPLOYEES
========================================================= */
export const getEmployees = async (): Promise<User[]> => {
  const res = await api.get("/users/employees");
  return unwrap(res) || [];
};

/* =========================================================
    CREATE EMPLOYEE
========================================================= */
export const createEmployee = async (user: {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  shift?: Shift;
  permissions?: Record<string, boolean>;
}) => {
  const res = await api.post("/users/employees", user);
  return unwrap(res);
};

/* =========================================================
    UPDATE USER
========================================================= */
export const updateUser = async (
  id: string,
  payload: Partial<User>
) => {
  const res = await api.put(`/users/${id}`, payload);
  return unwrap(res);
};

/* =========================================================
    DEACTIVATE USER
========================================================= */
export const deactivateUser = async (id: string) => {
  const res = await api.patch(`/users/${id}/deactivate`);
  return unwrap(res);
};

/* =========================================================
    ACTIVATE USER
========================================================= */
export const activateUser = async (id: string) => {
  const res = await api.patch(`/users/${id}/activate`);
  return unwrap(res);
};

/* =========================================================
    CHANGE PASSWORD
========================================================= */
export const changePassword = async (
  id: string,
  password: string
) => {
  const res = await api.patch(`/users/${id}/password`, {
    password,
  });
  return unwrap(res);
};

/* =========================================================
   GET USER BY ID
========================================================= */
export const getUserById = async (id: string): Promise<User | null> => {
  const res = await api.get(`/users/${id}`);
  return unwrap(res) || null;
};