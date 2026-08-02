/**
 * EMPLOYEE SERVICE
 * Servicio centralizado para operaciones de empleados
 * Lógica de negocio y cache
 */

import api from "@/services/api";
import type {
  Employee,
  EmployeeFormData,
  EmployeeFilters,
  GetEmployeesRequest,
  GetEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeResponse,
  UpdateEmployeeResponse,
  DeactivateEmployeeResponse,
  ActivateEmployeeResponse,
  ChangePasswordResponse,
  UpdateRolePermissionsResponse,
  UpdateShiftPermissionsResponse,
  ApiError,
} from "../types";
import { CACHE_CONFIG } from "../constants";

/* =========================================================
   CACHE
   Cache simple para empleados
========================================================= */
class EmployeeCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private enabled: boolean = CACHE_CONFIG.ENABLE_CACHE;

  set(key: string, data: any, ttl: number = CACHE_CONFIG.EMPLOYEES_LIST_TTL): void {
    if (!this.enabled) return;
    this.cache.set(key, { data, timestamp: Date.now() + ttl });
  }

  get(key: string): any | null {
    if (!this.enabled) return null;
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

const employeeCache = new EmployeeCache();

/* =========================================================
   ERROR HANDLER
   Manejo centralizado de errores
========================================================= */
const handleError = (error: any): never => {
  const apiError: ApiError = {
    success: false,
    error: error?.response?.data?.message || error?.message || "Error inesperado",
    message: error?.response?.data?.message || error?.message,
    code: error?.response?.data?.code,
    details: error?.response?.data?.details,
  };
  throw apiError;
};

/* =========================================================
   RESPONSE UNWRAPPER
   Desenvuelve respuestas de API
========================================================= */
const unwrap = <T>(res: any): T => {
  return res?.data?.data ?? res?.data ?? res;
};

/* =========================================================
   EMPLOYEE SERVICE
   Servicio principal de empleados
========================================================= */
class EmployeeService {
  /* =========================================================
     GET EMPLOYEES
     Obtener lista de empleados
  ========================================================= */
  async getEmployees(request?: GetEmployeesRequest): Promise<GetEmployeesResponse> {
    try {
      const cacheKey = `employees:${JSON.stringify(request)}`;
      const cached = employeeCache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const params = {
        ...request?.filters,
        page: request?.page || 1,
        pageSize: request?.pageSize || 20,
        sortBy: request?.sortBy,
        sortOrder: request?.sortOrder,
      };

      const res = await api.get("/users/employees", { params });
      const data = unwrap<GetEmployeesResponse>(res);
      
      employeeCache.set(cacheKey, data, CACHE_CONFIG.EMPLOYEES_LIST_TTL);
      
      return data;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     GET EMPLOYEE BY ID
     Obtener empleado por ID
  ========================================================= */
  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const cacheKey = `employee:${id}`;
      const cached = employeeCache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const res = await api.get(`/users/${id}`);
      const data = unwrap<Employee>(res);
      
      employeeCache.set(cacheKey, data, CACHE_CONFIG.EMPLOYEE_DETAIL_TTL);
      
      return data;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     CREATE EMPLOYEE
     Crear empleado
  ========================================================= */
  async createEmployee(data: EmployeeFormData): Promise<Employee> {
    try {
      employeeCache.invalidateAll(); // Invalidar cache de lista
      
      const res = await api.post("/users/employees", data);
      const result = unwrap<CreateEmployeeResponse>(res);
      
      return result.employee;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     UPDATE EMPLOYEE
     Actualizar empleado
  ========================================================= */
  async updateEmployee(id: string, data: Partial<EmployeeFormData>): Promise<Employee> {
    try {
      employeeCache.invalidate(`employee:${id}`);
      employeeCache.invalidateAll(); // Invalidar cache de lista
      
      const res = await api.put(`/users/${id}`, data);
      const result = unwrap<UpdateEmployeeResponse>(res);
      
      return result.employee;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     DEACTIVATE EMPLOYEE
     Desactivar empleado
  ========================================================= */
  async deactivateEmployee(id: string, reason?: string): Promise<boolean> {
    try {
      employeeCache.invalidate(`employee:${id}`);
      employeeCache.invalidateAll(); // Invalidar cache de lista
      
      const res = await api.patch(`/users/${id}/deactivate`, { reason });
      const result = unwrap<DeactivateEmployeeResponse>(res);
      
      return result.success;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     ACTIVATE EMPLOYEE
     Activar empleado
  ========================================================= */
  async activateEmployee(id: string, reason?: string): Promise<boolean> {
    try {
      employeeCache.invalidate(`employee:${id}`);
      employeeCache.invalidateAll(); // Invalidar cache de lista
      
      const res = await api.patch(`/users/${id}/activate`, { reason });
      const result = unwrap<ActivateEmployeeResponse>(res);
      
      return result.success;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     CHANGE PASSWORD
     Cambiar contraseña
  ========================================================= */
  async changePassword(id: string, password: string, currentPassword?: string): Promise<boolean> {
    try {
      const res = await api.patch(`/users/${id}/password`, { 
        password,
        ...(currentPassword && { currentPassword }),
      });
      const result = unwrap<ChangePasswordResponse>(res);
      
      return result.success;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     UPDATE ROLE PERMISSIONS
     Actualizar permisos de rol
  ========================================================= */
  async updateRolePermissions(role: string, permissions: Record<string, boolean>): Promise<boolean> {
    try {
      employeeCache.invalidateAll(); // Invalidar cache de lista
      
      const res = await api.patch(`/users/role/${role}/permissions`, { permissions });
      const result = unwrap<UpdateRolePermissionsResponse>(res);
      
      return result.success;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     UPDATE SHIFT PERMISSIONS
     Actualizar permisos de turno
  ========================================================= */
  async updateShiftPermissions(shift: string, permissions: Record<string, boolean>): Promise<boolean> {
    try {
      employeeCache.invalidateAll(); // Invalidar cache de lista
      
      const res = await api.patch(`/users/shift/${shift}/permissions`, { permissions });
      const result = unwrap<UpdateShiftPermissionsResponse>(res);
      
      return result.success;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     UPDATE SCHEDULE
     Actualizar horario
  ========================================================= */
  async updateSchedule(id: string, schedule: any): Promise<boolean> {
    try {
      employeeCache.invalidate(`employee:${id}`);
      employeeCache.invalidateAll(); // Invalidar cache de lista
      
      const res = await api.put(`/users/${id}/schedule`, { schedule });
      
      return true;
    } catch (error) {
      handleError(error);
    }
  }

  /* =========================================================
     CACHE METHODS
     Métodos de cache
  ========================================================= */
  invalidateCache(key?: string): void {
    if (key) {
      employeeCache.invalidate(key);
    } else {
      employeeCache.invalidateAll();
    }
  }

  invalidateEmployeeCache(id: string): void {
    employeeCache.invalidate(`employee:${id}`);
    employeeCache.invalidateAll();
  }

  clearCache(): void {
    employeeCache.invalidateAll();
  }
}

// Exportar instancia única
export const employeeService = new EmployeeService();

// Exportar clase para testing
export { EmployeeService };
