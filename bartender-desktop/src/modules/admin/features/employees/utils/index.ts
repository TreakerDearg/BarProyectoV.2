/**
 * EMPLOYEE UTILS INDEX
 * Exportación centralizada de utilidades del módulo de empleados
 */

export {
  getRelativeTime,
  getTenure,
  formatDate,
  formatDateTime,
  calculateEmployeeMetrics,
  getEmployeeStatus,
  isEmployeeOnline,
  filterEmployees,
  sortEmployees,
} from "./employeeHelpers";

export {
  validateEmail,
  validatePassword,
  validateName,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./employeeHelpers";

export {
  getRoleLabel,
  getRoleColor,
  getRoleTheme,
  getShiftLabel,
  getShiftTimeRange,
  getIdentityStatusLabel,
  canUserAccess,
  transformEmployeeToFormData,
  transformFormDataToEmployee,
} from "./employeeHelpers";

export {
  formatName,
  formatInitials,
  formatEmail,
  maskEmail,
  formatPhone,
  formatRole,
  formatRoleBadge,
  formatShift,
  formatShiftTime,
  formatStatus,
  formatStatusBadge,
  formatDate as formatUtilDate,
  formatDateTime as formatUtilDateTime,
  formatTime,
  formatRelativeTime as formatUtilRelativeTime,
  formatPercentage,
  formatNumber,
  formatCurrency,
  formatPermissionKey,
  formatPermissionsCount,
  formatEmployeeDisplayName,
  formatEmployeeSubtitle,
  formatEmployeeMeta,
} from "./employeeFormatters";
