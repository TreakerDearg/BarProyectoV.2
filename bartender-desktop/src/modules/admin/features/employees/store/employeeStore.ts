/**
 * EMPLOYEE STORE
 * Zustand store para gestión de estado global de empleados
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Employee, EmployeeFilters } from "../types";

/* =========================================================
   STORE STATE
   Estado del store
========================================================= */
interface EmployeeState {
  // Datos
  employees: Employee[];
  selectedEmployee: Employee | null;
  
  // Filtros
  filters: EmployeeFilters;
  search: string;
  
  // UI
  loading: boolean;
  error: string | null;
  
  // Paginación
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  
  // Ordenamiento
  sortBy: string;
  sortOrder: "asc" | "desc";
  
  // Acciones - Datos
  setEmployees: (employees: Employee[]) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  
  // Acciones - Filtros
  setFilters: (filters: EmployeeFilters) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  
  // Acciones - UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones - Paginación
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotal: (total: number) => void;
  setTotalPages: (totalPages: number) => void;
  
  // Acciones - Ordenamiento
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  
  // Acciones - Reset
  reset: () => void;
}

/* =========================================================
   INITIAL STATE
   Estado inicial
========================================================= */
const initialState = {
  employees: [],
  selectedEmployee: null,
  filters: {},
  search: "",
  loading: false,
  error: null,
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
  sortBy: "name",
  sortOrder: "asc" as const,
};

/* =========================================================
   EMPLOYEE STORE
   Store principal de empleados
========================================================= */
export const useEmployeeStore = create<EmployeeState>()(
  devtools(
    (set) => ({
      ...initialState,

      /* =========================================================
         ACCIONES - DATOS
      ========================================================= */
      setEmployees: (employees) => set({ employees }),
      
      setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
      
      addEmployee: (employee) => set((state) => ({
        employees: [employee, ...state.employees],
        total: state.total + 1,
      })),
      
      updateEmployee: (id, updatedEmployee) => set((state) => ({
        employees: state.employees.map((emp) =>
          emp._id === id ? { ...emp, ...updatedEmployee } : emp
        ),
        selectedEmployee:
          state.selectedEmployee?._id === id
            ? { ...state.selectedEmployee, ...updatedEmployee }
            : state.selectedEmployee,
      })),
      
      removeEmployee: (id) => set((state) => ({
        employees: state.employees.filter((emp) => emp._id !== id),
        selectedEmployee:
          state.selectedEmployee?._id === id ? null : state.selectedEmployee,
        total: Math.max(0, state.total - 1),
      })),

      /* =========================================================
         ACCIONES - FILTROS
      ========================================================= */
      setFilters: (filters) => set({ filters }),
      
      setSearch: (search) => set({ search }),
      
      clearFilters: () => set({
        filters: {},
        search: "",
        page: 1,
      }),

      /* =========================================================
         ACCIONES - UI
      ========================================================= */
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),

      /* =========================================================
         ACCIONES - PAGINACIÓN
      ========================================================= */
      setPage: (page) => set({ page }),
      
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      
      setTotal: (total) => set({ total }),
      
      setTotalPages: (totalPages) => set({ totalPages }),

      /* =========================================================
         ACCIONES - ORDENAMIENTO
      ========================================================= */
      setSortBy: (sortBy) => set({ sortBy }),
      
      setSortOrder: (sortOrder) => set({ sortOrder }),

      /* =========================================================
         ACCIONES - RESET
      ========================================================= */
      reset: () => set(initialState),
    }),
    { name: "EmployeeStore" }
  )
);

/* =========================================================
   SELECTORS
   Selectores optimizados para el store
========================================================= */
export const selectEmployees = (state: EmployeeState) => state.employees;
export const selectSelectedEmployee = (state: EmployeeState) => state.selectedEmployee;
export const selectFilters = (state: EmployeeState) => state.filters;
export const selectSearch = (state: EmployeeState) => state.search;
export const selectLoading = (state: EmployeeState) => state.loading;
export const selectError = (state: EmployeeState) => state.error;
export const selectPagination = (state: EmployeeState) => ({
  page: state.page,
  pageSize: state.pageSize,
  total: state.total,
  totalPages: state.totalPages,
});
export const selectSorting = (state: EmployeeState) => ({
  sortBy: state.sortBy,
  sortOrder: state.sortOrder,
});
