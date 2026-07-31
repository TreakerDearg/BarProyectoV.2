/**
 * USE EMPLOYEE PERMISSIONS HOOK
 * Hook para gestión de permisos de empleados
 */

import { useState, useCallback } from "react";
import { employeeService } from "../services";

interface UseEmployeePermissionsReturn {
  loading: boolean;
  error: string | null;
  updateRolePermissions: (role: string, permissions: Record<string, boolean>) => Promise<void>;
  updateShiftPermissions: (shift: string, permissions: Record<string, boolean>) => Promise<void>;
}

export const useEmployeePermissions = (): UseEmployeePermissionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRolePermissions = useCallback(async (role: string, permissions: Record<string, boolean>) => {
    setLoading(true);
    setError(null);

    try {
      await employeeService.updateRolePermissions(role, permissions);
    } catch (err: any) {
      setError(err.message || "Error al actualizar permisos de rol");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShiftPermissions = useCallback(async (shift: string, permissions: Record<string, boolean>) => {
    setLoading(true);
    setError(null);

    try {
      await employeeService.updateShiftPermissions(shift, permissions);
    } catch (err: any) {
      setError(err.message || "Error al actualizar permisos de turno");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    updateRolePermissions,
    updateShiftPermissions,
  };
};
