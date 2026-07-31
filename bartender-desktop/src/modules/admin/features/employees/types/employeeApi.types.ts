/**
 * EMPLOYEE API TYPES
 * Tipos específicos para la capa de API
 */

import type { Employee, EmployeeFormData, EmployeeFilters, EmployeeMetrics } from "./employee.types";

/* =========================================================
   API REQUEST TYPES
   Tipos para peticiones a la API
========================================================= */
export interface GetEmployeesRequest {
  filters?: EmployeeFilters;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateEmployeeRequest {
  employee: EmployeeFormData;
}

export interface UpdateEmployeeRequest {
  id: string;
  employee: Partial<EmployeeFormData>;
}

export interface DeactivateEmployeeRequest {
  id: string;
  reason?: string;
}

export interface ActivateEmployeeRequest {
  id: string;
  reason?: string;
}

export interface ChangePasswordRequest {
  id: string;
  password: string;
  currentPassword?: string;
}

export interface UpdateRolePermissionsRequest {
  role: string;
  permissions: Record<string, boolean>;
}

export interface UpdateShiftPermissionsRequest {
  shift: string;
  permissions: Record<string, boolean>;
}

export interface UpdateScheduleRequest {
  id: string;
  schedule: any;
}

/* =========================================================
   API RESPONSE TYPES
   Tipos para respuestas de la API
========================================================= */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
}

export interface GetEmployeesResponse {
  employees: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetEmployeeResponse {
  employee: Employee;
  metrics?: EmployeeMetrics;
}

export interface CreateEmployeeResponse {
  employee: Employee;
  message?: string;
}

export interface UpdateEmployeeResponse {
  employee: Employee;
  message?: string;
}

export interface DeactivateEmployeeResponse {
  success: boolean;
  message?: string;
}

export interface ActivateEmployeeResponse {
  success: boolean;
  message?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export interface UpdateRolePermissionsResponse {
  success: boolean;
  message?: string;
}

export interface UpdateShiftPermissionsResponse {
  success: boolean;
  message?: string;
}

/* =========================================================
   API ENDPOINT CONFIGS
   Configuración de endpoints
========================================================= */
export interface ApiEndpointConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  requiresAuth: boolean;
  cacheable?: boolean;
  cacheTTL?: number;
}

export const EMPLOYEE_API_ENDPOINTS: Record<string, ApiEndpointConfig> = {
  getEmployees: {
    url: "/users/employees",
    method: "GET",
    requiresAuth: true,
    cacheable: true,
    cacheTTL: 300000, // 5 minutos
  },
  getEmployee: {
    url: "/users/:id",
    method: "GET",
    requiresAuth: true,
    cacheable: true,
    cacheTTL: 60000, // 1 minuto
  },
  createEmployee: {
    url: "/users/employees",
    method: "POST",
    requiresAuth: true,
    cacheable: false,
  },
  updateEmployee: {
    url: "/users/:id",
    method: "PUT",
    requiresAuth: true,
    cacheable: false,
  },
  deactivateEmployee: {
    url: "/users/:id/deactivate",
    method: "PATCH",
    requiresAuth: true,
    cacheable: false,
  },
  activateEmployee: {
    url: "/users/:id/activate",
    method: "PATCH",
    requiresAuth: true,
    cacheable: false,
  },
  changePassword: {
    url: "/users/:id/password",
    method: "PATCH",
    requiresAuth: true,
    cacheable: false,
  },
  updateRolePermissions: {
    url: "/users/role/:role/permissions",
    method: "PATCH",
    requiresAuth: true,
    cacheable: false,
  },
  updateShiftPermissions: {
    url: "/users/shift/:shift/permissions",
    method: "PATCH",
    requiresAuth: true,
    cacheable: false,
  },
  updateSchedule: {
    url: "/users/:id/schedule",
    method: "PUT",
    requiresAuth: true,
    cacheable: false,
  },
};
