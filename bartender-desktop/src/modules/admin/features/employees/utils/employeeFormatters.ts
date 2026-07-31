/**
 * EMPLOYEE FORMATTERS
 * Funciones para formateo de datos de empleados
 */

import type { Employee, EmployeeRole, EmployeeShift } from "../types";

/* =========================================================
   NAME FORMATTERS
   Formateo de nombres
========================================================= */
export const formatName = (name: string): string => {
  return name.trim().replace(/\s+/g, " ");
};

export const formatInitials = (name: string): string => {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/* =========================================================
   EMAIL FORMATTERS
   Formateo de emails
========================================================= */
export const formatEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  
  const maskedLocal = local.length > 2
    ? local[0] + "*".repeat(local.length - 2) + local[local.length - 1]
    : local;
  
  return `${maskedLocal}@${domain}`;
};

/* =========================================================
   PHONE FORMATTERS
   Formateo de teléfonos
========================================================= */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

/* =========================================================
   ROLE FORMATTERS
   Formateo de roles
========================================================= */
export const formatRole = (role: EmployeeRole): string => {
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

export const formatRoleBadge = (role: EmployeeRole): { label: string; color: string } => {
  const roleConfig: Record<EmployeeRole, { label: string; color: string }> = {
    admin: { label: "Admin", color: "gold" },
    bartender: { label: "Bartender", color: "cyan" },
    waiter: { label: "Mozo", color: "emerald" },
    cashier: { label: "Cajero", color: "purple" },
    kitchen: { label: "Cocina", color: "orange" },
    owner: { label: "Dueño", color: "gold" },
    client: { label: "Cliente", color: "blue" },
  };
  return roleConfig[role] || { label: role, color: "gray" };
};

/* =========================================================
   SHIFT FORMATTERS
   Formateo de turnos
========================================================= */
export const formatShift = (shift: EmployeeShift | undefined): string => {
  if (!shift) return "Sin turno";
  const shiftLabels: Record<EmployeeShift, string> = {
    morning: "Mañana",
    afternoon: "Tarde",
    night: "Noche",
    event: "Evento",
  };
  return shiftLabels[shift] || shift;
};

export const formatShiftTime = (shift: EmployeeShift | undefined): string => {
  if (!shift) return "N/A";
  const shiftTimes: Record<EmployeeShift, string> = {
    morning: "06:00 - 14:00",
    afternoon: "14:00 - 22:00",
    night: "22:00 - 06:00",
    event: "Variable",
  };
  return shiftTimes[shift] || "N/A";
};

/* =========================================================
   STATUS FORMATTERS
   Formateo de estados
========================================================= */
export const formatStatus = (isActive: boolean): string => {
  return isActive ? "Activo" : "Inactivo";
};

export const formatStatusBadge = (isActive: boolean): { label: string; color: string } => {
  return isActive
    ? { label: "Activo", color: "emerald" }
    : { label: "Inactivo", color: "gray" };
};

/* =========================================================
   DATE FORMATTERS
   Formateo de fechas
========================================================= */
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

export const formatTime = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeTime = (date: Date | string | undefined): string => {
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

/* =========================================================
   METRICS FORMATTERS
   Formateo de métricas
========================================================= */
export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("es-AR").format(value);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
};

/* =========================================================
   PERMISSIONS FORMATTERS
   Formateo de permisos
========================================================= */
export const formatPermissionKey = (key: string): string => {
  return key
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatPermissionsCount = (permissions: Record<string, boolean> | undefined): number => {
  if (!permissions) return 0;
  return Object.values(permissions).filter(Boolean).length;
};

/* =========================================================
   EMPLOYEE FORMATTERS
   Formateo completo de empleado
========================================================= */
export const formatEmployeeDisplayName = (employee: Employee): string => {
  return employee.name;
};

export const formatEmployeeSubtitle = (employee: Employee): string => {
  const parts = [formatRole(employee.role)];
  if (employee.shift) parts.push(formatShift(employee.shift));
  return parts.join(" • ");
};

export const formatEmployeeMeta = (employee: Employee): string => {
  const parts = [];
  if (employee.email) parts.push(employee.email);
  if (employee.lastLogin) parts.push(formatRelativeTime(employee.lastLogin));
  return parts.join(" • ");
};
