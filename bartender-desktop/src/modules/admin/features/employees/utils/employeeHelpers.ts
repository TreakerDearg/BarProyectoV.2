/**
 * EMPLOYEE HELPERS
 * Funciones helper para el módulo de empleados
 */

import type { Employee, EmployeeMetrics, EmployeeShift, EmployeeRole } from "../types";

/* =========================================================
   TIME HELPERS
   Helpers para cálculos de tiempo
========================================================= */
export const getRelativeTime = (date: Date | string | undefined): string => {
  if (!date) return "Sin actividad";
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)}sem`;
  return `Hace ${Math.floor(diffDays / 30)}mes`;
};

export const getTenure = (createdAt: string | undefined): number => {
  if (!createdAt) return 0;
  const now = new Date();
  const then = new Date(createdAt);
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / 86400000);
};

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   EMPLOYEE METRICS HELPERS
   Helpers para cálculos de métricas
========================================================= */
export const calculateEmployeeMetrics = (employee: Employee): EmployeeMetrics => {
  const now = new Date();
  const createdAt = employee.createdAt ? new Date(employee.createdAt) : now;
  const lastLogin = employee.lastLogin ? new Date(employee.lastLogin) : undefined;
  
  // Calcular antigüedad en días
  const tenure = Math.floor((now.getTime() - createdAt.getTime()) / 86400000);
  
  // Calcular última actividad
  const lastActivity = lastLogin ? getRelativeTime(lastLogin) : "Sin actividad";
  
  // Métricas simuladas (en el futuro vendrán del backend)
  const totalShifts = Math.floor(Math.random() * 150) + 50;
  const performance = Math.floor(Math.random() * 20) + 80;
  const reliability = performance >= 90 ? "ELITE" : performance >= 80 ? "HIGH" : performance >= 70 ? "MEDIUM" : "LOW";
  
  // Sesiones y dispositivos (preparado para Bartender Identity)
  const activeSessions = employee.sessions?.filter(s => s.isActive).length || 0;
  const activeDevices = employee.devices?.filter(d => d.isActive).length || 0;
  
  return {
    totalShifts,
    performance,
    reliability,
    lastActivity,
    tenure,
    activeSessions,
    activeDevices,
  };
};

/* =========================================================
   EMPLOYEE STATUS HELPERS
   Helpers para determinar estado de empleado
========================================================= */
export const getEmployeeStatus = (employee: Employee): "active" | "inactive" => {
  if (!employee.isActive) return "inactive";
  if (employee.lockedUntil && new Date(employee.lockedUntil) > new Date()) return "inactive";
  return "active";
};

export const isEmployeeOnline = (employee: Employee): boolean => {
  if (!employee.lastLogin) return false;
  const lastLogin = new Date(employee.lastLogin);
  const now = new Date();
  const diffMs = now.getTime() - lastLogin.getTime();
  return diffMs < 5 * 60 * 1000; // Online si actividad hace menos de 5 minutos
};

/* =========================================================
   FILTER HELPERS
   Helpers para filtrado de empleados
========================================================= */
export const filterEmployees = (
  employees: Employee[],
  filters: {
    search?: string;
    roles?: EmployeeRole[];
    status?: ("active" | "inactive")[];
    shifts?: EmployeeShift[];
  }
): Employee[] => {
  let filtered = [...employees];
  
  // Filtro por búsqueda
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(emp =>
      emp.name?.toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower)
    );
  }
  
  // Filtro por roles
  if (filters.roles && filters.roles.length > 0) {
    filtered = filtered.filter(emp => filters.roles!.includes(emp.role));
  }
  
  // Filtro por estado
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(emp => {
      const status = getEmployeeStatus(emp);
      return filters.status!.includes(status as "active" | "inactive");
    });
  }
  
  // Filtro por turnos
  if (filters.shifts && filters.shifts.length > 0) {
    filtered = filtered.filter(emp => emp.shift && filters.shifts!.includes(emp.shift));
  }
  
  return filtered;
};

/* =========================================================
   SORT HELPERS
   Helpers para ordenamiento de empleados
========================================================= */
export const sortEmployees = (
  employees: Employee[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): Employee[] => {
  const sorted = [...employees];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "role":
        comparison = a.role.localeCompare(b.role);
        break;
      case "shift":
        comparison = (a.shift || "").localeCompare(b.shift || "");
        break;
      case "lastLogin":
        comparison = a.lastLogin ? b.lastLogin ? new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime() : -1 : b.lastLogin ? 1 : 0;
        break;
      case "createdAt":
        comparison = a.createdAt ? b.createdAt ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : -1 : b.createdAt ? 1 : 0;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === "desc" ? -comparison : comparison;
  });
  
  return sorted;
};

/* =========================================================
   VALIDATION HELPERS
   Helpers para validación
========================================================= */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; strength: number } => {
  if (!password) return { isValid: false, strength: 0 };
  
  let strength = 0;
  
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  const isValid = password.length >= 6;
  
  return { isValid, strength: Math.min(strength, 4) };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

/* =========================================================
   PERMISSION HELPERS
   Helpers para gestión de permisos
========================================================= */
export const hasPermission = (employee: Employee, permission: string): boolean => {
  return employee.permissions?.[permission as keyof typeof employee.permissions] === true;
};

export const hasAnyPermission = (employee: Employee, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(employee, permission));
};

export const hasAllPermissions = (employee: Employee, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(employee, permission));
};

/* =========================================================
   ROLE HELPERS
   Helpers para gestión de roles
========================================================= */
export const getRoleLabel = (role: EmployeeRole): string => {
  const roleLabels: Record<EmployeeRole, string> = {
    admin: "Administrador",
    bartender: "Bartender",
    waiter: "Mozo",
    cashier: "Cajero",
    kitchen: "Cocina",
    owner: "Dueño",
    client: "Cliente",
  };
  return roleLabels[role] || role;
};

export const getRoleColor = (role: EmployeeRole): string => {
  const roleColors: Record<EmployeeRole, string> = {
    admin: "gold",
    bartender: "cyan",
    waiter: "emerald",
    cashier: "purple",
    kitchen: "orange",
    owner: "gold",
    client: "blue",
  };
  return roleColors[role] || "gray";
};

export const getRoleTheme = (role: EmployeeRole) => {
  const roleThemes: Record<EmployeeRole, { gradient: string; borderColor: string; textColor: string; iconBg: string; iconColor: string }> = {
    admin: {
      gradient: "from-amber-400/20 via-amber-500/15 to-purple-500/10",
      borderColor: "border-amber-400/30",
      textColor: "text-amber-400",
      iconBg: "bg-amber-400/20",
      iconColor: "text-amber-400"
    },
    bartender: {
      gradient: "from-cyan-400/20 via-blue-400/15 to-purple-500/10",
      borderColor: "border-cyan-400/30",
      textColor: "text-cyan-400",
      iconBg: "bg-cyan-400/20",
      iconColor: "text-cyan-400"
    },
    waiter: {
      gradient: "from-emerald-400/20 via-green-400/15 to-cyan-400/10",
      borderColor: "border-emerald-400/30",
      textColor: "text-emerald-400",
      iconBg: "bg-emerald-400/20",
      iconColor: "text-emerald-400"
    },
    kitchen: {
      gradient: "from-orange-400/20 via-red-400/15 to-amber-400/10",
      borderColor: "border-orange-400/30",
      textColor: "text-orange-400",
      iconBg: "bg-orange-400/20",
      iconColor: "text-orange-400"
    },
    cashier: {
      gradient: "from-purple-400/20 via-violet-400/15 to-pink-400/10",
      borderColor: "border-purple-400/30",
      textColor: "text-purple-400",
      iconBg: "bg-purple-400/20",
      iconColor: "text-purple-400"
    },
    owner: {
      gradient: "from-gold-400/20 via-amber-500/15 to-purple-500/10",
      borderColor: "border-gold-400/30",
      textColor: "text-gold-400",
      iconBg: "bg-gold-400/20",
      iconColor: "text-gold-400"
    },
    client: {
      gradient: "from-blue-400/20 via-indigo-400/15 to-purple-500/10",
      borderColor: "border-blue-400/30",
      textColor: "text-blue-400",
      iconBg: "bg-blue-400/20",
      iconColor: "text-blue-400"
    }
  };
  return roleThemes[role] || roleThemes.waiter;
};

/* =========================================================
   SHIFT HELPERS
   Helpers para gestión de turnos
========================================================= */
export const getShiftLabel = (shift: EmployeeShift | undefined): string => {
  if (!shift) return "Sin turno";
  const shiftLabels: Record<EmployeeShift, string> = {
    morning: "Mañana",
    afternoon: "Tarde",
    night: "Noche",
    event: "Evento",
  };
  return shiftLabels[shift] || shift;
};

export const getShiftTimeRange = (shift: EmployeeShift | undefined): string => {
  if (!shift) return "N/A";
  const shiftTimeRanges: Record<EmployeeShift, string> = {
    morning: "06:00 - 14:00",
    afternoon: "14:00 - 22:00",
    night: "22:00 - 06:00",
    event: "Variable",
  };
  return shiftTimeRanges[shift] || "N/A";
};

/* =========================================================
   IDENTITY STATUS HELPERS (Bartender Identity)
   Helpers para gestión de estados de identidad
========================================================= */
export const getIdentityStatusLabel = (identityStatus: string | undefined): string => {
  if (!identityStatus) return "Desconocido";
  const statusLabels: Record<string, string> = {
    ACTIVE: "Activo",
    OFF_SHIFT: "Fuera de Turno",
    ON_SHIFT: "En Turno",
    ON_BREAK: "En Descanso",
    LOCKED_TEMPORARILY: "Bloqueado Temporalmente",
    BLOCKED: "Bloqueado",
    VERIFICATION_REQUIRED: "Verificación Requerida",
    INACTIVE: "Inactivo",
  };
  return statusLabels[identityStatus] || identityStatus;
};

export const canUserAccess = (employee: Employee): boolean => {
  return employee.canAccess !== false && employee.isActive;
};

/* =========================================================
   DATA TRANSFORMATION HELPERS
   Helpers para transformación de datos
========================================================= */
export const transformEmployeeToFormData = (employee: Employee) => {
  return {
    basic: {
      name: employee.name,
      email: employee.email,
      password: "",
      confirmPassword: "",
    },
    role: {
      role: employee.role,
      shift: employee.shift,
      permissions: employee.permissions,
    },
    schedule: {
      schedule: employee.schedule || {},
    },
    permissions: {
      permissions: employee.permissions,
    },
    advanced: {
      isActive: employee.isActive,
      metadata: employee.metadata,
    },
  };
};

export const transformFormDataToEmployee = (formData: any, employeeId?: string) => {
  return {
    ...(employeeId && { _id: employeeId }),
    name: formData.basic.name,
    email: formData.basic.email,
    ...(formData.basic.password && { password: formData.basic.password }),
    role: formData.role.role,
    shift: formData.role.shift,
    permissions: formData.role.permissions,
    schedule: formData.schedule.schedule,
    isActive: formData.advanced.isActive,
    metadata: formData.advanced.metadata,
  };
};
