/**
 * USE EMPLOYEE HOOK
 * Hook para gestión de un empleado individual
 */

import { useState, useEffect, useCallback } from "react";
import { employeeService } from "../services";
import type { Employee, EmployeeFormData } from "../types";

interface UseEmployeeOptions {
  autoFetch?: boolean;
}

interface UseEmployeeReturn {
  employee: Employee | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
  updateEmployee: (data: Partial<EmployeeFormData>) => Promise<void>;
  deactivateEmployee: (reason?: string) => Promise<void>;
  activateEmployee: (reason?: string) => Promise<void>;
  changePassword: (password: string, currentPassword?: string) => Promise<void>;
  updateSchedule: (schedule: any) => Promise<void>;
}

export const useEmployee = (id: string | undefined, options: UseEmployeeOptions = {}): UseEmployeeReturn => {
  const { autoFetch = true } = options;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await employeeService.getEmployeeById(id);
      setEmployee(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar empleado");
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchEmployee();
    }
  }, [autoFetch, id, fetchEmployee]);

  const refresh = useCallback(async () => {
    await fetchEmployee();
  }, [fetchEmployee]);

  const refetch = useCallback(async () => {
    if (id) {
      employeeService.invalidateEmployeeCache(id);
      await fetchEmployee();
    }
  }, [id, fetchEmployee]);

  const updateEmployee = useCallback(async (data: Partial<EmployeeFormData>) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await employeeService.updateEmployee(id, data);
      setEmployee(updated);
    } catch (err: any) {
      setError(err.message || "Error al actualizar empleado");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const deactivateEmployee = useCallback(async (reason?: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      await employeeService.deactivateEmployee(id, reason);
      if (employee) {
        setEmployee({ ...employee, isActive: false });
      }
    } catch (err: any) {
      setError(err.message || "Error al desactivar empleado");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, employee]);

  const activateEmployee = useCallback(async (reason?: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      await employeeService.activateEmployee(id, reason);
      if (employee) {
        setEmployee({ ...employee, isActive: true });
      }
    } catch (err: any) {
      setError(err.message || "Error al activar empleado");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, employee]);

  const changePassword = useCallback(async (password: string, currentPassword?: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      await employeeService.changePassword(id, password, currentPassword);
    } catch (err: any) {
      setError(err.message || "Error al cambiar contraseña");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateSchedule = useCallback(async (schedule: any) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      await employeeService.updateSchedule(id, schedule);
      await fetchEmployee();
    } catch (err: any) {
      setError(err.message || "Error al actualizar horario");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, fetchEmployee]);

  return {
    employee,
    loading,
    error,
    refresh,
    refetch,
    updateEmployee,
    deactivateEmployee,
    activateEmployee,
    changePassword,
    updateSchedule,
  };
};
