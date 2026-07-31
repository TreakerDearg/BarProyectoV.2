/**
 * EMPLOYEE TYPES
 * Modelo unificado de empleado preparado para Bartender Identity
 * Mantiene compatibilidad con el modelo actual mientras prepara la integración
 */

/* =========================================================
   ROLES
   Roles actuales + rol futuro de Bartender Identity
========================================================= */
export type EmployeeRole =
  | "admin"
  | "bartender"
  | "waiter"
  | "cashier"
  | "kitchen"
  | "owner"
  | "client";

/* =========================================================
   SHIFTS
   Turnos de trabajo
========================================================= */
export type EmployeeShift =
  | "morning"
  | "afternoon"
  | "night"
  | "event";

/* =========================================================
   IDENTITY STATUS (Bartender Identity)
   Estados de identidad del Identity Decision Engine
========================================================= */
export type IdentityStatus =
  | "ACTIVE"
  | "OFF_SHIFT"
  | "ON_SHIFT"
  | "ON_BREAK"
  | "LOCKED_TEMPORARILY"
  | "BLOCKED"
  | "VERIFICATION_REQUIRED"
  | "INACTIVE";

/* =========================================================
   PERMISSIONS (Actuales + Futuros)
   Permisos granulares del sistema
========================================================= */
export type PermissionKey =
  // Empleados
  | "viewEmployees"
  | "createEmployee"
  | "editEmployee"
  | "deactivateEmployee"
  | "deleteEmployee"
  // Dashboard
  | "viewDashboard"
  // Órdenes
  | "manageOrders"
  | "viewOrders"
  | "createOrder"
  | "editOrder"
  | "cancelOrder"
  // Inventario
  | "manageInventory"
  | "viewInventory"
  | "updateInventory"
  // Recetas
  | "manageRecipes"
  | "viewRecipes"
  | "createRecipe"
  | "editRecipe"
  // POS
  | "accessPOS"
  // Mesas
  | "manageTables"
  | "viewTables"
  | "assignTable"
  // Reservas
  | "manageReservations"
  | "viewReservations"
  | "createReservation"
  // Descuentos
  | "manageDiscounts"
  | "viewDiscounts"
  | "createDiscount"
  // Promociones
  | "managePromotions"
  | "viewPromotions"
  // Reportes
  | "viewReports"
  | "generateReports"
  // Usuarios
  | "manageUsers"
  | "viewUsers"
  // Roles
  | "manageRoles"
  | "viewRoles"
  // Permisos
  | "managePermissions"
  | "viewPermissions"
  // Turnos
  | "manageShifts"
  | "viewShifts"
  | "assignShifts"
  // Asistencia
  | "manageAttendance"
  | "viewAttendance"
  | "checkIn"
  | "checkOut"
  // Rendimiento
  | "managePerformance"
  | "viewPerformance"
  // Activity Logs
  | "viewActivityLogs"
  | "exportActivityLogs"
  // Alertas
  | "manageAlerts"
  | "viewAlerts"
  // Configuración
  | "manageSettings"
  | "viewSettings"
  // Menú
  | "manageMenu"
  | "viewMenu"
  // Productos
  | "manageProducts"
  | "viewProducts"
  // Categorías
  | "manageCategories"
  | "viewCategories"
  // Pagos
  | "managePayments"
  | "viewPayments"
  | "processRefunds"
  | "manageTips"
  // Ruleta
  | "manageRoulette"
  | "viewRoulette"
  // Salón
  | "manageSalon"
  | "viewSalon"
  // Kiosks
  | "manageKiosks"
  | "viewKiosks";

export type Permissions = Partial<Record<PermissionKey, boolean>>;

/* =========================================================
   SCHEDULE & AVAILABILITY
   Horarios y disponibilidad
========================================================= */
export interface DaySchedule {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface EmployeeSchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

/* =========================================================
   SESSION (Bartender Identity Ecosystem)
   Información de sesión del ecosistema
========================================================= */
export interface SessionInfo {
  sessionId: string;
  platform: string;
  userAgent: string;
  ipAddress: string;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

/* =========================================================
   DEVICE (Bartender Identity Ecosystem)
   Información de dispositivo del ecosistema
========================================================= */
export interface DeviceInfo {
  deviceId: string;
  platform: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastSeen: string;
  isActive: boolean;
  isCurrent: boolean;
}

/* =========================================================
   OAUTH (Bartender Identity)
   Información de OAuth
========================================================= */
export interface OAuthInfo {
  provider: "google" | "microsoft" | "apple";
  providerId: string;
  email: string;
  isLinked: boolean;
  linkedAt?: string;
  lastUsed?: string;
}

/* =========================================================
   ACTIVITY LOG (Bartender Identity)
   Información de actividad
========================================================= */
export interface ActivityLogEntry {
  _id: string;
  activityType: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/* =========================================================
   WORKSPACE (Bartender Identity)
   Información de workspace
========================================================= */
export interface WorkspaceInfo {
  layoutType: string;
  widgets: string[];
  navigation: string[];
  customization: Record<string, any>;
}

/* =========================================================
   EMPLOYEE MODEL (Unificado)
   Modelo completo que incluye campos actuales y futuros
========================================================= */
export interface Employee {
  // Campos actuales (compatibilidad con backend existente)
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: EmployeeRole;
  shift?: EmployeeShift | null;
  isEmployee: boolean;
  permissions: Record<string, boolean>;
  isActive: boolean;
  deletedAt?: Date | null;
  lastLogin?: Date | null;
  loginAttempts?: number;
  lockedUntil?: Date | null;
  refreshToken?: string;
  googleId?: string | null;
  provider?: "local" | "google" | "apple" | "github" | "microsoft" | "facebook";
  providerVerified?: boolean;
  avatar?: string | null;
  lastProviderLogin?: Date | null;
  schedule?: any;
  performance?: any;
  compliance?: any;
  attendance?: any;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
  activeSessions?: number;
  activeDevices?: number;
  // Bartender Identity fields
  identityStatus?: IdentityStatus;
  sessions?: SessionInfo[];
  devices?: DeviceInfo[];
  oauth?: OAuthInfo;
  activityLogs?: ActivityLogEntry[];
  workspace?: WorkspaceInfo;
}

/* =========================================================
   EMPLOYEE FILTERS
   Filtros para búsqueda y filtrado
========================================================= */
export interface EmployeeFilters {
  search?: string;
  role?: EmployeeRole[];
  status?: ("active" | "inactive")[];
  shift?: EmployeeShift[];
  identityStatus?: IdentityStatus[];
  hasOAuth?: boolean;
  hasActiveSession?: boolean;
}

/* =========================================================
   EMPLOYEE METRICS
   Métricas de empleado
========================================================= */
export interface EmployeeMetrics {
  performance: number;
  totalShifts: number;
  totalHours: number;
  averageRating: number;
  totalOrders: number;
  totalSales: number;
  avgOrderTime: number;
  errorRate: number;
  onTimeRate: number;
  attendanceRate: number;
  modules: {
    tables: {
      totalServed: number;
      avgServiceTime: number;
      customerSatisfaction: number;
    };
    orders: {
      totalProcessed: number;
      avgPrepTime: number;
      accuracy: number;
    };
    payments: {
      totalProcessed: number;
      avgProcessingTime: number;
      accuracy: number;
    };
    reservations: {
      totalManaged: number;
      noShowRate: number;
      confirmationRate: number;
    };
  };
  weekly: {
    shifts: number;
    hours: number;
    sales: number;
    rating: number;
  };
  monthly: {
    shifts: number;
    hours: number;
    sales: number;
    rating: number;
  };
  tenure: number;
  activeSessions: number;
  activeDevices: number;
}

/* =========================================================
   EMPLOYEE FORM DATA
   Datos para formulario de creación/edición
========================================================= */
export interface EmployeeFormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: EmployeeRole;
  shift?: EmployeeShift;
  permissions?: Permissions;
  schedule?: EmployeeSchedule;
}

/* =========================================================
   EMPLOYEE API RESPONSES
   Tipos para respuestas de API
========================================================= */
export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmployeeDetailResponse {
  employee: Employee;
  metrics?: EmployeeMetrics;
  sessions?: SessionInfo[];
  devices?: DeviceInfo[];
  activityLogs?: ActivityLogEntry[];
}

/* =========================================================
   EMPLOYEE ERROR TYPES
   Tipos de errores
========================================================= */
export interface EmployeeError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, any>;
}
