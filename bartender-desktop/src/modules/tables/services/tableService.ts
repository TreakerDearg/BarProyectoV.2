import { api } from "./../../../services/api";
import type { Table } from "../types/table";

export const getTables = async (): Promise<Table[]> => {
  const { data } = await api.get("/tables");
  return data;
};

export const createTable = async (table: Table): Promise<Table> => {
  const { data } = await api.post("/tables", table);
  return data;
};

export const updateTable = async (
  id: string,
  table: Partial<Table>
): Promise<Table> => {
  const { data } = await api.put(`/tables/${id}`, table);
  return data;
};

export const deleteTable = async (id: string): Promise<void> => {
  await api.delete(`/tables/${id}`);
};