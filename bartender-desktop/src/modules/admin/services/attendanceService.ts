/**
 * attendanceService.ts
 *
 * Consume los endpoints de /attendance del backend.
 * Provee datos reales de asistencia para el Dashboard y EmployeeCard.
 */

import api from "../../../services/api";

// ── Tipos ────────────────────────────────────────────────────────

export interface AttendanceRecord {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    shift?: string | null;
  };
  shift: string;
  date: string;
  checkIn: { time: string; location?: string; ip?: string };
  checkOut?: { time: string };
  workedHours?: number;
  status: "present" | "late" | "absent" | "half-day" | "early-departure";
}

export interface TodayAttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  onShift: number;        // sin check-out todavía
  totalHours: number;
  employees: AttendanceRecord[];
}

// ── Helpers ───────────────────────────────────────────────────────

const unwrap = (res: any): any => res?.data ?? res ?? null;

// ── API calls ─────────────────────────────────────────────────────

/**
 * Empleados con check-in activo hoy (sin check-out).
 * Usa GET /attendance/today del backend.
 */
export const getTodayAttendance = async (): Promise<TodayAttendanceStats> => {
  const res = await api.get("/attendance/today");
  return unwrap(res) as TodayAttendanceStats;
};

/**
 * Alias explícito para el panel de "activos ahora"
 */
export const getActiveEmployees = getTodayAttendance;

/**
 * Historial de asistencia de un empleado específico.
 */
export const getUserAttendance = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<AttendanceRecord[]> => {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate)   params.set("endDate",   endDate);
  const res = await api.get(`/attendance/user/${userId}?${params.toString()}`);
  return (unwrap(res) || []) as AttendanceRecord[];
};

/**
 * Estadísticas agregadas de asistencia.
 */
export const getAttendanceStats = async (
  startDate?: string,
  endDate?: string
): Promise<unknown> => {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate)   params.set("endDate",   endDate);
  const res = await api.get(`/attendance/stats?${params.toString()}`);
  return unwrap(res);
};
