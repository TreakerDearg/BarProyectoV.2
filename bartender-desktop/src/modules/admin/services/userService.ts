import { api } from "../../../services/api";
import type { User } from "../types/user";

export const getEmployees = async (): Promise<User[]> => {
  const { data } = await api.get("/users/employees");
  return data;
};

export const createEmployee = async (user: any) => {
  const { data } = await api.post("/users/employees", user);
  return data;
};

export const deactivateUser = async (id: string) => {
  await api.put(`/users/${id}/deactivate`);
};