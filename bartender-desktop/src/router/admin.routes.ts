import EmployeesPage from "../modules/admin/pages/EmployeesPage";
import RoleManagementPage from "../modules/admin/pages/RoleManagementPage";
import PermissionPage from "../modules/admin/pages/PermissionPage";
import ShiftPermissionsPage from "../modules/admin/pages/ShiftPermissionsPage";
import EmployeeActivityTrackingPage from "../modules/admin/pages/EmployeeActivityTrackingPage";
import ShiftManagementPage from "../modules/admin/pages/ShiftManagementPage";
import ShiftMetricsPage from "../modules/admin/pages/ShiftMetricsPage";
import SettingsPage from "../modules/admin/pages/SettingsPage";

export const adminRoutes = [
  {
    path: "/employees",
    element: EmployeesPage,
  },
  {
    path: "/employees/roles",
    element: RoleManagementPage,
  },
  {
    path: "/employees/permissions",
    element: PermissionPage,
  },
  {
    path: "/employees/shifts",
    element: ShiftPermissionsPage,
  },
  {
    path: "/employees/activity",
    element: EmployeeActivityTrackingPage,
  },
  {
    path: "/employees/shift-management",
    element: ShiftManagementPage,
  },
  {
    path: "/employees/shift-metrics",
    element: ShiftMetricsPage,
  },
  {
    path: "/settings",
    element: SettingsPage,
  },
];