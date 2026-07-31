/**
 * USE EMPLOYEE FILTERS HOOK
 * Hook para gestión de filtros de empleados
 */

import { useState, useCallback, useMemo } from "react";
import type { EmployeeFilters, EmployeeRole, EmployeeShift, IdentityStatus } from "../types";

interface UseEmployeeFiltersReturn {
  filters: EmployeeFilters;
  search: string;
  setSearch: (search: string) => void;
  setRoleFilter: (roles: EmployeeRole[]) => void;
  setStatusFilter: (status: ("active" | "inactive")[]) => void;
  setShiftFilter: (shifts: EmployeeShift[]) => void;
  setIdentityStatusFilter: (status: IdentityStatus[]) => void;
  setOAuthFilter: (hasOAuth: boolean) => void;
  setSessionFilter: (hasActiveSession: boolean) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export const useEmployeeFilters = (): UseEmployeeFiltersReturn => {
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [search, setSearch] = useState("");

  const setRoleFilter = useCallback((roles: EmployeeRole[]) => {
    setFilters(prev => ({
      ...prev,
      role: roles.length > 0 ? roles : undefined,
    }));
  }, []);

  const setStatusFilter = useCallback((status: ("active" | "inactive")[]) => {
    setFilters(prev => ({
      ...prev,
      status: status.length > 0 ? status : undefined,
    }));
  }, []);

  const setShiftFilter = useCallback((shifts: EmployeeShift[]) => {
    setFilters(prev => ({
      ...prev,
      shift: shifts.length > 0 ? shifts : undefined,
    }));
  }, []);

  const setIdentityStatusFilter = useCallback((status: IdentityStatus[]) => {
    setFilters(prev => ({
      ...prev,
      identityStatus: status.length > 0 ? status : undefined,
    }));
  }, []);

  const setOAuthFilter = useCallback((hasOAuth: boolean) => {
    setFilters(prev => ({
      ...prev,
      hasOAuth: hasOAuth || undefined,
    }));
  }, []);

  const setSessionFilter = useCallback((hasActiveSession: boolean) => {
    setFilters(prev => ({
      ...prev,
      hasActiveSession: hasActiveSession || undefined,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearch("");
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      search.trim() !== "" ||
      Object.values(filters).some(value => value !== undefined && value !== null)
    );
  }, [search, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim() !== "") count++;
    if (filters.role) count++;
    if (filters.status) count++;
    if (filters.shift) count++;
    if (filters.identityStatus) count++;
    if (filters.hasOAuth !== undefined) count++;
    if (filters.hasActiveSession !== undefined) count++;
    return count;
  }, [search, filters]);

  return {
    filters: {
      ...filters,
      search: search.trim() || undefined,
    },
    search,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    setShiftFilter,
    setIdentityStatusFilter,
    setOAuthFilter,
    setSessionFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};
