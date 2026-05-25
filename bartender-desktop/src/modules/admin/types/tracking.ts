/* =========================================================
   ACTIVITY TRACKING TYPES
========================================================= */

export type ActivityType =
  | "login"
  | "logout"
  | "order_created"
  | "order_completed"
  | "order_cancelled"
  | "payment_processed"
  | "inventory_updated"
  | "discount_applied"
  | "table_assigned"
  | "menu_viewed"
  | "recipe_accessed"
  | "roulette_used"
  | "permission_change"
  | "settings_updated";

export interface ActivityLog {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
  shift?: string;
  duration?: number; // en milisegundos
}

export interface ActivityMetrics {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  averageSessionDuration: number;
  peakActivityTime: string;
  mostUsedModules: string[];
}

/* =========================================================
   EMPLOYEE PERFORMANCE KPIs
========================================================= */

export interface EmployeeKPIs {
  userId: string;
  userName: string;
  period: {
    start: string;
    end: string;
  };
  
  // Pedidos
  ordersCompleted: number;
  ordersCancelled: number;
  averageOrderTime: number; // minutos
  ordersPerHour: number;
  
  // Ventas
  totalSales: number;
  averageOrderValue: number;
  salesPerHour: number;
  
  // Productividad
  productivityScore: number; // 0-100
  efficiencyScore: number; // 0-100
  customerRating?: number; // 1-5
  
  // Actividad
  loginCount: number;
  totalActiveTime: number; // minutos
  activeTimePercentage: number; // % del turno
  
  // Comparación
  rankAmongPeers: number;
  percentile: number;
  
  lastUpdated: string;
}

export interface KPITrend {
  date: string;
  value: number;
  target?: number;
}

/* =========================================================
   SHIFT MANAGEMENT
========================================================= */

export interface ShiftSchedule {
  _id: string;
  shiftType: "morning" | "afternoon" | "night" | "event";
  
  // Horarios
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  breaks: BreakTime[];
  
  // Asignación
  assignedEmployees: any[]; // userIds or populated user objects
  maxEmployees: number;
  minEmployees: number;
  
  // Restricciones
  modules: string[]; // módulos activos durante el turno
  permissions: Record<string, boolean>; // permisos especiales
  
  // Configuración
  isActive: boolean;
  priority: number; // para ordenar turnos
  description?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface BreakTime {
  startTime: string;
  endTime: string;
  description?: string;
  isPaid?: boolean;
}

export interface ShiftAssignment {
  _id: string;
  userId: string;
  userName: string;
  shiftId: string;
  shiftType: string;
  date: string; // YYYY-MM-DD
  status: "scheduled" | "completed" | "missed" | "late" | "left_early";
  
  // Horarios reales
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  
  // Métricas
  performanceScore?: number;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ShiftMetrics {
  shiftType: string;
  date: string;
  
  // Rendimiento
  totalOrders: number;
  totalSales: number;
  averageOrderValue: number;
  averageOrderTime: number;
  
  // Personal
  employeesPresent: number;
  employeesScheduled: number;
  totalProductivityScore: number;
  
  // Actividad
  peakHours: string[];
  averageOrderPerEmployee: number;
  salesPerEmployee: number;
  
  // Comparación
  comparisonWithPreviousPeriod: {
    ordersChange: number; // %
    salesChange: number; // %
    productivityChange: number; // %
  };
  
  lastUpdated: string;
}

/* =========================================================
   NOTIFICATION & ALERT TYPES
========================================================= */

export interface PerformanceAlert {
  _id: string;
  userId: string;
  userName: string;
  alertType: "low_performance" | "high_performance" | "absenteeism" | "late_arrival" | "early_departure" | "unusual_activity";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  data?: Record<string, any>;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

/* =========================================================
   ANALYTICS & REPORTS
========================================================= */

export interface EmployeePerformanceReport {
  employeeId: string;
  employeeName: string;
  period: {
    start: string;
    end: string;
  };
  
  kpis: EmployeeKPIs;
  trends: {
    productivity: KPITrend[];
    sales: KPITrend[];
    orders: KPITrend[];
  };
  
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  
  generatedAt: string;
}

export interface ShiftAnalysisReport {
  shiftType: string;
  dateRange: {
    start: string;
    end: string;
  };
  
  dailyMetrics: ShiftMetrics[];
  summary: {
    averageOrders: number;
    averageSales: number;
    averageProductivity: number;
    bestDay: string;
    worstDay: string;
    optimalStaffing: number;
  };
  
  recommendations: string[];
  
  generatedAt: string;
}