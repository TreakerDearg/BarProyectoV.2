// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Auth API
// Endpoints: /auth/login, /auth/register, /auth/me, /auth/logout,
//            /auth/profile, /auth/password, /auth/favorites
// ─────────────────────────────────────────────────────────────────────────────

import { api, getErrorMessage } from './client';
import type { ApiResponse, AuthUserDTO } from '../types/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LoginPayload   { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string }
export interface UpdateProfilePayload { name?: string; phone?: string }
export interface ChangePasswordPayload { currentPassword: string; newPassword: string }

export interface AuthResult {
  token:        string;
  refreshToken?: string;
  user:         AuthUserDTO;
}

export interface OrderHistoryItem {
  _id:         string;
  status:      string;
  total:       number;
  itemCount:   number;
  createdAt:   string;
  tableNumber: number | null;
}

export interface ReservationSummary {
  _id:       string;
  status:    string;
  startTime: string;
  guests:    number;
  tableNumber?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Humaniza mensajes de error para mostrarlos al usuario */
export function humanizeAuthError(message: string | undefined, status?: number): string {
  if (!message && !status) return 'Algo salió mal. Intentá de nuevo.';
  const msg = (message ?? '').toLowerCase();
  if (msg.includes('credenciales') || msg.includes('contraseña') || status === 401)
    return 'El email o la contraseña no son correctos.';
  if (msg.includes('bloqueada') || msg.includes('locked'))
    return 'Tu cuenta está bloqueada temporalmente.';
  if (msg.includes('inactiv'))
    return 'Tu cuenta está desactivada. Contactá al soporte.';
  if (msg.includes('ya está registrado') || msg.includes('email') || status === 409)
    return 'Ya existe una cuenta con ese email.';
  if (msg.includes('contraseña') && msg.includes('mínimo'))
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'No pudimos conectar con el servidor.';
  if (status === 500) return 'Error en el servidor. Intentá en unos minutos.';
  if (message && message.length < 120) return message;
  return 'Algo salió mal. Intentá de nuevo.';
}

// ── Normaliza el usuario desde distintos shapes del backend ──────────────────
function extractUser(raw: any): AuthUserDTO | null {
  const u = raw?.user ?? raw;
  const id = u?._id ?? u?.id;
  if (!id) return null;
  return {
    id:     String(id),
    name:   u.name   ?? '',
    email:  u.email  ?? '',
    role:   u.role   ?? 'client',
    phone:  u.phone  ?? null,
    avatar: u.avatar ?? null,
  };
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** POST /auth/login → { token, refreshToken, user } */
export async function loginUser(payload: LoginPayload): Promise<AuthResult> {
  const res = await api.post<any>('/auth/login', payload, {
    headers: { 'X-Platform': 'mobile' },
  });
  const data = res.data?.data ?? res.data;
  const token = data?.token ?? data?.accessToken;
  if (!token) throw new Error('No se recibió token de acceso.');
  const user = extractUser(data);
  if (!user) throw new Error('No se pudo obtener la información del usuario.');
  return { token, refreshToken: data?.refreshToken, user };
}

/** POST /auth/register → { token, user } */
export async function registerUser(payload: RegisterPayload): Promise<AuthResult> {
  const res = await api.post<any>('/auth/register', payload, {
    headers: { 'X-Platform': 'mobile' },
  });
  const data = res.data?.data ?? res.data;
  const token = data?.token ?? data?.accessToken;
  if (!token) throw new Error('No se recibió token de acceso.');
  const user = extractUser(data);
  if (!user) throw new Error('No se pudo obtener la información del usuario.');
  return { token, refreshToken: data?.refreshToken, user };
}

/** GET /auth/me → AuthUserDTO */
export async function getMyProfile(): Promise<AuthUserDTO> {
  const res = await api.get<any>('/auth/me');
  const raw = res.data?.data ?? res.data;
  const user = extractUser({ user: raw });
  if (!user) throw new Error('No se pudo obtener el perfil.');
  return user;
}

/** POST /auth/logout */
export async function logoutUser(refreshToken?: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken }).catch(() => {});
}

/** PATCH /auth/profile */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<AuthUserDTO> {
  const res = await api.patch<any>('/auth/profile', payload);
  const raw = res.data?.data ?? res.data;
  const user = extractUser({ user: raw });
  if (!user) throw new Error('No se pudo actualizar el perfil.');
  return user;
}

/** PATCH /auth/password */
export async function changeMyPassword(payload: ChangePasswordPayload): Promise<void> {
  await api.patch('/auth/password', payload);
}

/** GET /auth/favorites */
export async function getMyFavorites(): Promise<string[]> {
  const res = await api.get<any>('/auth/favorites');
  const data = res.data?.data ?? res.data;
  if (Array.isArray(data)) {
    return data.map((item: any) => (typeof item === 'string' ? item : item?.id ?? item?._id ?? ''))
               .filter(Boolean);
  }
  return [];
}

/** POST /auth/favorites */
export async function addFavorite(productId: string): Promise<void> {
  await api.post('/auth/favorites', { productId });
}

/** DELETE /auth/favorites/:productId */
export async function removeFavorite(productId: string): Promise<void> {
  await api.delete(`/auth/favorites/${productId}`);
}

/** GET /orders/my-history */
export async function getMyOrderHistory(limit = 8): Promise<OrderHistoryItem[]> {
  const res = await api.get<any>('/orders/my-history', { params: { limit } });
  return res.data?.data ?? [];
}

/** GET /reservations — filtrado por usuario autenticado */
export async function getMyReservations(params?: { upcoming?: boolean; limit?: number }): Promise<ReservationSummary[]> {
  const res = await api.get<any>('/reservations/my', { params });
  return res.data?.data ?? [];
}
