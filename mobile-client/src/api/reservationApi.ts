// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Reservation API
// Endpoints: /reservations/check-availability, /reservations, /reservations/my
// ─────────────────────────────────────────────────────────────────────────────

import { api } from './client';
import type {
  AvailabilityCheckResponse,
  CreateReservationPayload,
  ReservationDTO,
} from '../types/api';

// ── Check availability ────────────────────────────────────────────────────────
export async function checkAvailability(
  date:   string,
  guests: number
): Promise<AvailabilityCheckResponse> {
  const res = await api.get<any>('/reservations/check-availability', {
    params: { date, guests },
  });
  const data = res.data?.data ?? res.data;
  // Normalizar respuesta — el backend puede devolver directo el array de slots
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
  // Primero intenta /reservations/my (endpoint específico para usuarios)
  try {
    const res = await api.get<any>('/reservations/my', { params });
    return res.data?.data ?? res.data ?? [];
  } catch {
    // Fallback: endpoint genérico con filtro de usuario via token
    const res = await api.get<any>('/reservations', { params: { ...params, own: true } });
    return res.data?.data ?? [];
  }
}
