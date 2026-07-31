/**
 * USE EMPLOYEES HOOK
 * Hook principal para gestión de empleados
 */

import { useState, useEffect, useCallback } from "react";
import { employeeService } from "../services";
import type { Employee, EmployeeFilters, GetEmployeesRequest } from "../types";

interface UseEmployeesOptions {
  autoFetch?: boolean;
  filters?: EmployeeFilters;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UseEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
  setFilters: (filters: EmployeeFilters) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
}

export const useEmployees = (options: UseEmployeesOptions = {}): UseEmployeesReturn => {
  const {
    autoFetch = true,
    filters: initialFilters = {},
    page: initialPage = 1,
    pageSize: initialPageSize = 20,
    sortBy: initialSortBy = "name",
    sortOrder: initialSortOrder = "asc",
  } = options;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<EmployeeFilters>(initialFilters);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const request: GetEmployeesRequest = {
        filters,
        page,
        pageSize,
        sortBy,
        sortOrder,
      };

      const response = await employeeService.getEmployees(request);
      
      setEmployees(response.employees);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || "Error al cargar empleados");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    if (autoFetch) {
      fetchEmployees();
    }
  }, [autoFetch, fetchEmployees]);

  const refresh = useCallback(async () => {
    await fetchEmployees();
  }, [fetchEmployees]);

  const refetch = useCallback(async () => {
    employeeService.invalidateCache();
    await fetchEmployees();
  }, [fetchEmployees]);

  const handleSetFilters = useCallback((newFilters: EmployeeFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  }, []);

  const handleSetSortBy = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  const handleSetSortOrder = useCallback((newSortOrder: "asc" | "desc") => {
    setSortOrder(newSortOrder);
  }, []);

  return {
    employees,
    loading,
    error,
    total,
    page,
    pageSize,
    totalPages,
    refresh,
    refetch,
    setFilters: handleSetFilters,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    setSortBy: handleSetSortBy,
    setSortOrder: handleSetSortOrder,
  };
};
