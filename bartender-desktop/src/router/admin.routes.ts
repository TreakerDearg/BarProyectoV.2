import EmployeesPage from "../modules/admin/pages/EmployeesPage";
import RoleManagementPage from "../modules/admin/pages/RoleManagementPage";
import PermissionPage from "../modules/admin/pages/PermissionPage";
import ShiftPermissionsPage from "../modules/admin/pages/ShiftPermissionsPage";

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
];