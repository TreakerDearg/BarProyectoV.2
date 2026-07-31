/**
 * EMPLOYEE CONSTANTS
 * Constantes del módulo de empleados
 */

import type { EmployeeRole, EmployeeShift, IdentityStatus } from "../types";

/* =========================================================
   ROLES
   Configuración de roles
========================================================= */
export const ROLES: Record<EmployeeRole, { label: string; color: string; icon: string; description: string }> = {
  admin: {
    label: "Administrador",
    color: "gold",
    icon: "shield",
    description: "Acceso completo al sistema",
  },
  bartender: {
    label: "Bartender",
    color: "cyan",
    icon: "zap",
    description: "Gestión de bebidas y órdenes",
  },
  waiter: {
    label: "Mozo",
    color: "emerald",
    icon: "award",
    description: "Atención al cliente y mesas",
  },
  cashier: {
    label: "Cajero",
    color: "purple",
    icon: "credit-card",
    description: "Gestión de pagos",
  },
  kitchen: {
    label: "Cocina",
    color: "orange",
    icon: "chef-hat",
    description: "Preparación de alimentos",
  },
  owner: {
    label: "Dueño",
    color: "gold",
    icon: "crown",
    description: "Propietario del negocio",
  },
  client: {
    label: "Cliente",
    color: "blue",
    icon: "user",
    description: "Cliente del sistema",
  },
};

/* =========================================================
   SHIFTS
   Configuración de turnos
========================================================= */
export const SHIFTS: Record<EmployeeShift, { label: string; color: string; icon: string; timeRange: string }> = {
  morning: {
    label: "Mañana",
    color: "emerald",
    icon: "sun",
    timeRange: "06:00 - 14:00",
  },
  afternoon: {
    label: "Tarde",
    color: "gold",
    icon: "sun",
    timeRange: "14:00 - 22:00",
  },
  night: {
    label: "Noche",
    color: "purple",
    icon: "moon",
    timeRange: "22:00 - 06:00",
  },
  event: {
    label: "Evento",
    color: "pink",
    icon: "calendar",
    timeRange: "Variable",
  },
};

/* =========================================================
   IDENTITY STATUS
   Configuración de estados de identidad (Bartender Identity)
========================================================= */
export const IDENTITY_STATUS: Record<IdentityStatus, { label: string; color: string; icon: string; description: string }> = {
  ACTIVE: {
    label: "Activo",
    color: "emerald",
    icon: "check-circle",
    description: "Usuario activo y operativo",
  },
  OFF_SHIFT: {
    label: "Fuera de Turno",
    color: "gray",
    icon: "clock",
    description: "Usuario fuera de su turno",
  },
  ON_SHIFT: {
    label: "En Turno",
    color: "emerald",
    icon: "briefcase",
    description: "Usuario trabajando en su turno",
  },
  ON_BREAK: {
    label: "En Descanso",
    color: "yellow",
    icon: "coffee",
    description: "Usuario en descanso",
  },
  LOCKED_TEMPORARILY: {
    label: "Bloqueado Temporalmente",
    color: "orange",
    icon: "lock",
    description: "Usuario bloqueado temporalmente",
  },
  BLOCKED: {
    label: "Bloqueado",
    color: "red",
    icon: "ban",
    description: "Usuario bloqueado permanentemente",
  },
  VERIFICATION_REQUIRED: {
    label: "Verificación Requerida",
    color: "yellow",
    icon: "alert-circle",
    description: "Requiere verificación",
  },
  INACTIVE: {
    label: "Inactivo",
    color: "gray",
    icon: "user-x",
    description: "Usuario inactivo",
  },
};

/* =========================================================
   PERMISSIONS
   Configuración de permisos
========================================================= */
export const PERMISSION_CATEGORIES = {
  EMPLOYEES: "Empleados",
  DASHBOARD: "Dashboard",
  ORDERS: "Órdenes",
  INVENTORY: "Inventario",
  RECIPES: "Recetas",
  POS: "Punto de Venta",
  TABLES: "Mesas",
  RESERVATIONS: "Reservas",
  DISCOUNTS: "Descuentos",
  PROMOTIONS: "Promociones",
  REPORTS: "Reportes",
  USERS: "Usuarios",
  ROLES: "Roles",
  PERMISSIONS: "Permisos",
  SHIFTS: "Turnos",
  ATTENDANCE: "Asistencia",
  PERFORMANCE: "Rendimiento",
  ACTIVITY_LOGS: "Activity Logs",
  ALERTS: "Alertas",
  SETTINGS: "Configuración",
  MENU: "Menú",
  PRODUCTS: "Productos",
  CATEGORIES: "Categorías",
  PAYMENTS: "Pagos",
  ROULETTE: "Ruleta",
  SALON: "Salón",
  KIOSKS: "Kiosks",
} as const;

/* =========================================================
   CACHE CONFIG
   Configuración de cache
========================================================= */
export const CACHE_CONFIG = {
  EMPLOYEES_LIST_TTL: 300000, // 5 minutos
  EMPLOYEE_DETAIL_TTL: 60000, // 1 minuto
  EMPLOYEE_METRICS_TTL: 120000, // 2 minutos
  ENABLE_CACHE: true,
} as const;

/* =========================================================
   PAGINATION
   Configuración de paginación
========================================================= */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

/* =========================================================
   VALIDATION
   Configuración de validación
========================================================= */
export const VALIDATION_CONFIG = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION: 15 * 60 * 1000, // 15 minutos
} as const;

/* =========================================================
   UI CONFIG
   Configuración de UI
========================================================= */
export const UI_CONFIG = {
  CARD_ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
} as const;

/* =========================================================
   API CONFIG
   Configuración de API
========================================================= */
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

/* =========================================================
   SESSION CONFIG
   Configuración de sesión (Bartender Identity)
========================================================= */
export const SESSION_CONFIG = {
  MAX_SESSIONS_PER_USER: 5,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  WARNING_TIMEOUT: 5 * 60 * 1000, // 5 minutos
} as const;

/* =========================================================
   DEVICE CONFIG
   Configuración de dispositivo (Bartender Identity)
========================================================= */
export const DEVICE_CONFIG = {
  MAX_DEVICES_PER_USER: 10,
  DEVICE_EXPIRY_DAYS: 30,
} as const;

/* =========================================================
   ACTIVITY LOG CONFIG
   Configuración de Activity Logs (Bartender Identity)
========================================================= */
export const ACTIVITY_LOG_CONFIG = {
  MAX_LOGS_PER_USER: 1000,
  LOG_RETENTION_DAYS: 90,
} as const;
