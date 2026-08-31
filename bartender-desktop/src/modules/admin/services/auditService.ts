/**
 * auditService.ts
 *
 * Consume GET /audit del backend — lee desde ActivityLog real.
 */

import api from "../../../services/api";
import type { AuditLog } from "../../../components/shared/AuditLogSystem";

// ── Tipos ─────────────────────────────────────────────────────────

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  activityType?: string;
  userId?: string;
  userRole?: string;
  shift?: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────

const unwrap = (res: any): any => res?.data ?? res ?? null;

// ── API calls ─────────────────────────────────────────────────────

/**
 * Obtiene logs de auditoría paginados desde ActivityLog real.
 */
export const getAuditLogs = async (
  params: AuditQueryParams = {}
): Promise<AuditLogsResponse> => {
  const query = new URLSearchParams();
  if (params.page)         query.set("page",         String(params.page));
  if (params.limit)        query.set("limit",        String(params.limit));
  if (params.startDate)    query.set("startDate",    params.startDate);
  if (params.endDate)      query.set("endDate",      params.endDate);
  if (params.activityType) query.set("activityType", params.activityType);
  if (params.userId)       query.set("userId",       params.userId);
  if (params.userRole)     query.set("userRole",     params.userRole);
  if (params.shift)        query.set("shift",        params.shift);

  const res = await api.get(`/audit?${query.toString()}`);
  const data = unwrap(res);

  // Normalizar timestamps a objetos Date para que AuditLogSystem funcione
  const logs: AuditLog[] = (data?.logs || []).map((log: any) => ({
    ...log,
    timestamp: new Date(log.timestamp),
  }));

  return {
    logs,
    pagination: data?.pagination ?? { page: 1, limit: 50, total: 0, totalPages: 0 },
  };
};

/**
 * Logs de auditoría filtrados por empleado.
 */
export const getEmployeeAuditLogs = async (
  userId: string,
  limit = 30
): Promise<AuditLog[]> => {
  const { logs } = await getAuditLogs({ userId, limit, page: 1 });
  return logs;
};

/**
 * Descarga export Excel desde el backend.
 */
export const exportAuditLogs = async (): Promise<void> => {
  const response = await api.get("/audit/export", { responseType: "blob" });
  const url = URL.createObjectURL(new Blob([response as any]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
