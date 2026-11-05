// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Reservation API
// Endpoints: /reservations/check-availability, /reservations, /reservations/my,
//            /reservations/available/tables
// ─────────────────────────────────────────────────────────────────────────────

import { api } from './client';
import type {
  AvailabilityCheckResponse,
  CreateReservationPayload,
  ReservationDTO,
  AvailableTableDTO,
} from '../types/api';

// ── Check availability ────────────────────────────────────────────────────────
// FIX CRÍTICO: el backend espera {start, end, guests} NO {date, guests}.
// Generamos el rango del día completo (18:00 a 23:59) para obtener todos los slots.
export async function checkAvailability(
  date:   string,
  guests: number
): Promise<AvailabilityCheckResponse> {
  const dayStart = new Date(date + 'T18:00:00');
  const dayEnd   = new Date(date + 'T23:59:59');

  const res = await api.get<any>('/reservations/check-availability', {
    params: {
      start:  dayStart.toISOString(),
      end:    dayEnd.toISOString(),
      guests,
    },
  });

  const data = res.data?.data ?? res.data;

  // Normalizar — el backend puede devolver directo el array de slots o un objeto
  if (Array.isArray(data)) {
    return {
      available: data.length > 0 && data.some((s: any) => s.available),
      slots:     data,
      date,
      guests,
    };
  }
  return {
    available: data?.available ?? false,
    slots:     data?.slots ?? [],
    date:      data?.date  ?? date,
    guests:    data?.guests ?? guests,
  };
}

// ── Create reservation ────────────────────────────────────────────────────────
export async function createReservation(
  payload: CreateReservationPayload
): Promise<ReservationDTO> {
  const res = await api.post<any>('/reservations', payload);
  return res.data?.data ?? res.data;
}

// ── My reservations (requires auth) ──────────────────────────────────────────
export async function getMyReservationsFromApi(params?: {
  upcoming?: boolean;
  limit?:    number;
}): Promise<ReservationDTO[]> {
  try {
    const res = await api.get<any>('/reservations/my', { params });
    const raw = res.data?.data ?? res.data ?? [];
    const arr = Array.isArray(raw) ? raw : (raw?.reservations ?? raw?.items ?? []);
    return Array.isArray(arr) ? arr : [];
  } catch {
    // Fallback: endpoint genérico con filtro de usuario via token
    const res = await api.get<any>('/reservations', { params: { ...params, own: true } });
    const raw = res.data?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }
}

// ── Get available tables ─────────────────────────────────────────────────────
export async function getAvailableTables(
  startTime: string,
  endTime:   string,
  guests:    number
): Promise<AvailableTableDTO[]> {
  const res = await api.get<any>('/reservations/available/tables', {
    params: { startTime, endTime, guests },
  });
  const raw = res.data?.data ?? res.data ?? [];
  return Array.isArray(raw) ? raw : [];
}
