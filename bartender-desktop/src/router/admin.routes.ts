import EmployeesPage from "../modules/admin/pages/EmployeesPage";
import ShiftAttendancePage from "../modules/admin/pages/ShiftAttendancePage";
import RolePermissionMatrixPage from "../modules/admin/pages/RolePermissionMatrixPage";
import WorkforceIntelligenceDashboard from "../modules/admin/pages/WorkforceIntelligenceDashboard";
import SettingsPage from "../modules/admin/pages/SettingsPage";
import AlertsConfigurationPage from "../modules/admin/pages/AlertsConfigurationPage";

export const adminRoutes = [
  // 1. Directorio & Plantilla 360°
  {
    path: "/employees",
    element: EmployeesPage,
  },
  {
    path: "/employees/:id",
    element: EmployeesPage,
  },

  // 2. Turnos & Asistencia en Vivo (Consolidado)
  {
    path: "/employees/shifts",
    element: ShiftAttendancePage,
  },
  {
    path: "/employees/shift-management",
    element: ShiftAttendancePage,
  },

  // 3. Roles & Matriz Granular de Permisos (Consolidado)
  {
    path: "/employees/roles",
    element: RolePermissionMatrixPage,
  },
  {
    path: "/employees/permissions",
    element: RolePermissionMatrixPage,
  },

  // 4. Inteligencia Laboral & Auditoría (Consolidado)
  {
    path: "/employees/dashboard",
    element: WorkforceIntelligenceDashboard,
  },
  {
    path: "/employees/activity",
    element: WorkforceIntelligenceDashboard,
  },
  {
    path: "/employees/shift-metrics",
    element: WorkforceIntelligenceDashboard,
  },

  // Configuración & Alertas
  {
    path: "/settings",
    element: SettingsPage,
  },
  {
    path: "/settings/alerts",
    element: AlertsConfigurationPage,
  },
];
