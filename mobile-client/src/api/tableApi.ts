import { api } from "./client";
import type { ApiResponse, TablePublicDTO } from "../types/api";

export interface TableCodeLookupResponse {
  tableId: string;
  tableNumber: number;
  sessionId: string;
  tableCode: string;
}

export async function lookupTableByCode(code: string): Promise<TableCodeLookupResponse> {
  const res = await api.get<ApiResponse<TableCodeLookupResponse>>(`/tables/code/${code}`);
  return res.data.data;
}

export async function getTableDetails(tableId: string): Promise<TablePublicDTO> {
  const res = await api.get<ApiResponse<TablePublicDTO>>(`/tables/${tableId}`);
  return res.data.data;
}
