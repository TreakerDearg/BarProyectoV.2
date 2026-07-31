/**
 * EMPLOYEE TYPES INDEX
 * Exportación centralizada de todos los tipos del módulo de empleados
 */

// Tipos principales
export type {
  EmployeeRole,
  EmployeeShift,
  IdentityStatus,
  PermissionKey,
  Permissions,
  DaySchedule,
  EmployeeSchedule,
  SessionInfo,
  DeviceInfo,
  OAuthInfo,
  ActivityLogEntry,
  WorkspaceInfo,
  Employee,
  EmployeeFilters,
  EmployeeMetrics,
  EmployeeFormData,
  EmployeeListResponse,
  EmployeeDetailResponse,
  EmployeeError,
} from "./employee.types";

// Tipos de API
export type {
  GetEmployeesRequest,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  DeactivateEmployeeRequest,
  ActivateEmployeeRequest,
  ChangePasswordRequest,
  UpdateRolePermissionsRequest,
  UpdateShiftPermissionsRequest,
  UpdateScheduleRequest,
  ApiResponse,
  ApiError,
  GetEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeResponse,
  UpdateEmployeeResponse,
  DeactivateEmployeeResponse,
  ActivateEmployeeResponse,
  ChangePasswordResponse,
  UpdateRolePermissionsResponse,
  UpdateShiftPermissionsResponse,
  ApiEndpointConfig,
} from "./employeeApi.types";

export { EMPLOYEE_API_ENDPOINTS } from "./employeeApi.types";

// Tipos de formulario
export type {
  FormSection,
  BasicFormData,
  RoleFormData,
  ScheduleFormData,
  PermissionsFormData,
  OAuthFormData,
  AdvancedFormData,
  CompleteEmployeeFormData,
  FormValidationErrors,
  FormState,
  FormConfig,
  ValidationRules,
  FormActions,
} from "./employeeForm.types";

export {
  DEFAULT_BASIC_DATA,
  DEFAULT_ROLE_DATA,
  DEFAULT_SCHEDULE_DATA,
  DEFAULT_PERMISSIONS_DATA,
  DEFAULT_ADVANCED_DATA,
  DEFAULT_FORM_DATA,
  DEFAULT_FORM_CONFIG,
} from "./employeeForm.types";
