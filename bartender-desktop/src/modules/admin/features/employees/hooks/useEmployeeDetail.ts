/**
 * EMPLOYEE DETAIL HOOK
 * Hook optimizado para carga diferida de datos de detalle de empleado
 */

import { useState, useEffect, useCallback } from "react";
import { employeeService } from "../services";
import type { Employee, EmployeeFormData } from "../types";

interface UseEmployeeDetailOptions {
  autoFetch?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

interface UseEmployeeDetailReturn {
  employee: Employee | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateEmployee: (data: Partial<EmployeeFormData>) => Promise<void>;
  clearCache: () => void;
}

export function useEmployeeDetail(
  employeeId: string | undefined,
  options: UseEmployeeDetailOptions = {}
): UseEmployeeDetailReturn {
  const { autoFetch = true, cacheKey = `employee_${employeeId}`, cacheTTL = 5 * 60 * 1000 } = options;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = useCallback(async () => {
    if (!employeeId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await employeeService.getEmployeeById(employeeId);
      setEmployee(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar empleado");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const refresh = useCallback(async () => {
    await employeeService.invalidateEmployeeCache(employeeId!);
    await fetchEmployee();
  }, [employeeId, fetchEmployee]);

  const updateEmployee = useCallback(async (data: Partial<EmployeeFormData>) => {
    if (!employeeId) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await employeeService.updateEmployee(employeeId, data);
      setEmployee(updated);
      await employeeService.invalidateEmployeeCache(employeeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar empleado");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const clearCache = useCallback(() => {
    employeeService.invalidateCache(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    if (autoFetch) {
      fetchEmployee();
    }
  }, [autoFetch, fetchEmployee]);

  return {
    employee,
    loading,
    error,
    refresh,
    updateEmployee,
    clearCache,
  };
}
