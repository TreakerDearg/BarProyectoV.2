// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Fuente única del vocabulario de estados
// El mismo estado se muestra igual en Home, Carta, Pedidos, Reservas y Cuenta:
// una sola definición de label + color + fondo + icono por estado.
// Regla: ninguna pantalla define sus propios mapas de estado.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Clock, Flame, CheckCircle2, XCircle, BellRing,
  UtensilsCrossed, CalendarCheck, AlertCircle, Sparkles,
  QrCode, ShoppingBag,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Colors, NocturneColors } from '../theme/colors';
import type {
  OrderPublicDTO, OrderItemDTO, ReservationDTO, TablePublicDTO,
} from '../types/api';

// ── Tipos (derivados de los DTO reales del backend) ───────────────────────────

export type OrderStatus       = OrderPublicDTO['status'];
export type ItemStatus        = NonNullable<OrderItemDTO['status']>;
export type ReservationStatus = ReservationDTO['status'];
export type TableStatus       = TablePublicDTO['status'];
export type ServiceMode       = 'table' | 'bar';

export type StatusKind = 'order' | 'item' | 'reservation' | 'table' | 'service';

export interface StatusMeta {
  /** Texto para el cliente — nunca nombres técnicos. */
  label: string;
  /** Color de texto/icono sobre fondo oscuro. */
  color: string;
  /** Fondo tintado de la píldora. */
  bg:    string;
  icon:  LucideIcon;
}

// ── Pedido ────────────────────────────────────────────────────────────────────

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending:       { label: 'Recibido',       color: Colors.info,    bg: NocturneColors.infoMuted,    icon: Clock },
  'in-progress': { label: 'En preparación', color: Colors.warning, bg: NocturneColors.warningMuted, icon: Flame },
  completed:     { label: 'Servido',        color: Colors.success, bg: NocturneColors.successMuted, icon: CheckCircle2 },
  cancelled:     { label: 'Cancelado',      color: Colors.error,   bg: NocturneColors.errorMuted,   icon: XCircle },
};

/** Pasos del tracker en orden cronológico (cancelado queda fuera del flujo). */
export const ORDER_STATUS_STEPS = ['pending', 'in-progress', 'completed'] as const;

export function getOrderStepIndex(status: string): number {
  return (ORDER_STATUS_STEPS as readonly string[]).indexOf(status);
}

/** Minutos estimados hasta estar listo, según el estado actual. */
export const ORDER_ETA_MINUTES: Record<OrderStatus, number> = {
  pending:       15,
  'in-progress': 8,
  completed:     0,
  cancelled:     0,
};

export function getOrderEtaMinutes(status: string): number {
  return ORDER_ETA_MINUTES[status as OrderStatus] ?? 15;
}

/** Mensajes en lenguaje cliente para la pantalla de seguimiento. */
export const ORDER_STATUS_MESSAGE: Record<OrderStatus, string> = {
  pending:       'Tu comanda fue recibida por el personal. Pronto comenzará la preparación.',
  'in-progress': 'El bartender está preparando tus bebidas con las recetas oficiales.',
  completed:     '¡Tu pedido fue servido! Disfrutá la experiencia Nebula.',
  cancelled:     'Esta comanda fue cancelada.',
};

export function getOrderStatusMessage(status: string): string {
  return ORDER_STATUS_MESSAGE[status as OrderStatus] ?? ORDER_STATUS_MESSAGE.pending;
}

// ── Items de la comanda ───────────────────────────────────────────────────────

export const ITEM_STATUS_META: Record<ItemStatus, StatusMeta> = {
  pending:   { label: 'En cola',    color: Colors.textMuted, bg: NocturneColors.surfaceContainerHigh, icon: Clock },
  preparing: { label: 'Preparando', color: Colors.warning,   bg: NocturneColors.warningMuted,         icon: Flame },
  ready:     { label: 'Listo',      color: Colors.success,   bg: NocturneColors.successMuted,         icon: BellRing },
  served:    { label: 'Servido',    color: Colors.primary,   bg: Colors.goldMuted,                    icon: UtensilsCrossed },
  cancelled: { label: 'Cancelado',  color: Colors.error,     bg: NocturneColors.errorMuted,           icon: XCircle },
};

// ── Reservas ──────────────────────────────────────────────────────────────────

export const RESERVATION_STATUS_META: Record<ReservationStatus, StatusMeta> = {
  pending:   { label: 'Pendiente',  color: Colors.warning,   bg: NocturneColors.warningMuted,         icon: Clock },
  confirmed: { label: 'Confirmada', color: Colors.success,   bg: NocturneColors.successMuted,         icon: CalendarCheck },
  seated:    { label: 'En mesa',    color: Colors.info,      bg: NocturneColors.infoMuted,            icon: UtensilsCrossed },
  completed: { label: 'Completada', color: Colors.textMuted, bg: NocturneColors.surfaceContainerHigh, icon: Sparkles },
  cancelled: { label: 'Cancelada',  color: Colors.error,     bg: NocturneColors.errorMuted,           icon: XCircle },
  'no-show': { label: 'No asistió', color: Colors.error,     bg: NocturneColors.errorMuted,           icon: AlertCircle },
};

// ── Mesas ─────────────────────────────────────────────────────────────────────

export const TABLE_STATUS_META: Record<TableStatus, StatusMeta> = {
  available:   { label: 'Disponible',    color: Colors.success,   bg: NocturneColors.successMuted,         icon: CheckCircle2 },
  reserved:    { label: 'Reservada',     color: Colors.warning,   bg: NocturneColors.warningMuted,         icon: CalendarCheck },
  occupied:    { label: 'Ocupada',       color: Colors.info,      bg: NocturneColors.infoMuted,            icon: UtensilsCrossed },
  maintenance: { label: 'Mantenimiento', color: Colors.textMuted, bg: NocturneColors.surfaceContainerHigh, icon: AlertCircle },
};

// ── Modo de servicio (cómo recibe el cliente) ─────────────────────────────────

export interface ServiceModeMeta extends StatusMeta {
  /** Etiqueta corta para chips y badges compactos. */
  shortLabel: string;
}

export const SERVICE_MODE_META: Record<ServiceMode, ServiceModeMeta> = {
  table: {
    label:      'En tu mesa',
    shortLabel: 'Mesa',
    color:      Colors.primary,
    bg:         Colors.goldMuted,
    icon:       QrCode,
  },
  bar: {
    label:      'Retiro en barra',
    shortLabel: 'Barra',
    color:      Colors.info,
    bg:         NocturneColors.infoMuted,
    icon:       ShoppingBag,
  },
};

/** "Mesa #12" / "Mesa" / "Retiro en barra" — para chips de sesión y resúmenes. */
export function formatServiceLabel(mode: ServiceMode, tableNumber?: number | null): string {
  if (mode === 'table') {
    return tableNumber != null
      ? `Mesa #${tableNumber}`
      : SERVICE_MODE_META.table.shortLabel;
  }
  return SERVICE_MODE_META.bar.label;
}

// ── Acceso genérico ───────────────────────────────────────────────────────────

const META_BY_KIND: Record<StatusKind, Record<string, StatusMeta>> = {
  order:       ORDER_STATUS_META,
  item:        ITEM_STATUS_META,
  reservation: RESERVATION_STATUS_META,
  table:       TABLE_STATUS_META,
  service:     SERVICE_MODE_META,
};

/** Metadata segura para cualquier estado (tolera strings de payloads Socket.IO). */
export function getStatusMeta(kind: StatusKind, status: string): StatusMeta {
  const meta = META_BY_KIND[kind]?.[status];
  return meta ?? {
    label: status,
    color: Colors.textMuted,
    bg:    NocturneColors.surfaceContainerHigh,
    icon:  AlertCircle,
  };
}

// ── Atajos por dominio (lectura más clara en las pantallas) ──────────────────

export function getOrderStatusMeta(status: string): StatusMeta {
  return getStatusMeta('order', status);
}

export function getItemStatusMeta(status: string): StatusMeta {
  return getStatusMeta('item', status);
}

export function getReservationStatusMeta(status: string): StatusMeta {
  return getStatusMeta('reservation', status);
}

export function getTableStatusMeta(status: string): StatusMeta {
  return getStatusMeta('table', status);
}
