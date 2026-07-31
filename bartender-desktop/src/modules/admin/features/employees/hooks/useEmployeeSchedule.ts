/**
 * USE EMPLOYEE SCHEDULE HOOK
 * Hook para gestión de horarios de empleados
 */

import { useState, useCallback } from "react";
import { employeeService } from "../services";

interface UseEmployeeScheduleReturn {
  loading: boolean;
  error: string | null;
  updateSchedule: (id: string, schedule: any) => Promise<void>;
}

export const useEmployeeSchedule = (): UseEmployeeScheduleReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSchedule = useCallback(async (id: string, schedule: any) => {
    setLoading(true);
    setError(null);

    try {
      await employeeService.updateSchedule(id, schedule);
    } catch (err: any) {
      setError(err.message || "Error al actualizar horario");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    updateSchedule,
  };
};
