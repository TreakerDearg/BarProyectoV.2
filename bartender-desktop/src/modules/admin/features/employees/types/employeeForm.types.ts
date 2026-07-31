/**
 * EMPLOYEE FORM TYPES
 * Tipos específicos para formularios de empleados
 */

import type { EmployeeRole, EmployeeShift, Permissions, EmployeeSchedule } from "./employee.types";

/* =========================================================
   FORM SECTIONS
   Secciones del formulario de empleado
========================================================= */
export type FormSection =
  | "basic"
  | "role"
  | "schedule"
  | "permissions"
  | "oauth"
  | "advanced";

/* =========================================================
   BASIC FORM DATA
   Datos básicos del formulario
========================================================= */
export interface BasicFormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

/* =========================================================
   ROLE FORM DATA
   Datos de rol del formulario
========================================================= */
export interface RoleFormData {
  role: EmployeeRole;
  shift?: EmployeeShift;
  permissions?: Permissions;
}

/* =========================================================
   SCHEDULE FORM DATA
   Datos de horario del formulario
========================================================= */
export interface ScheduleFormData {
  schedule: EmployeeSchedule;
}

/* =========================================================
   PERMISSIONS FORM DATA
   Datos de permisos del formulario
========================================================= */
export interface PermissionsFormData {
  permissions: Permissions;
  customPermissions?: Permissions;
}

/* =========================================================
   OAUTH FORM DATA
   Datos de OAuth del formulario
========================================================= */
export interface OAuthFormData {
  linkGoogle?: boolean;
  unlinkGoogle?: boolean;
}

/* =========================================================
   ADVANCED FORM DATA
   Datos avanzados del formulario
========================================================= */
export interface AdvancedFormData {
  isActive: boolean;
  metadata?: Record<string, any>;
}

/* =========================================================
   COMPLETE FORM DATA
   Datos completos del formulario
========================================================= */
export interface CompleteEmployeeFormData {
  basic: BasicFormData;
  role: RoleFormData;
  schedule: ScheduleFormData;
  permissions: PermissionsFormData;
  oauth?: OAuthFormData;
  advanced: AdvancedFormData;
}

/* =========================================================
   FORM VALIDATION ERRORS
   Errores de validación del formulario
========================================================= */
export interface FormValidationErrors {
  basic?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  role?: {
    role?: string;
    shift?: string;
  };
  schedule?: {
    schedule?: string;
  };
  permissions?: {
    permissions?: string;
  };
  advanced?: {
    isActive?: string;
  };
}

/* =========================================================
   FORM STATE
   Estado del formulario
========================================================= */
export interface FormState {
  data: CompleteEmployeeFormData;
  errors: FormValidationErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  currentSection: FormSection;
}

/* =========================================================
   FORM CONFIG
   Configuración del formulario
========================================================= */
export interface FormConfig {
  mode: "create" | "edit";
  showPassword: boolean;
  requirePassword: boolean;
  showSchedule: boolean;
  showPermissions: boolean;
  showOAuth: boolean;
  showAdvanced: boolean;
  sections: FormSection[];
  validationRules: ValidationRules;
}

/* =========================================================
   VALIDATION RULES
   Reglas de validación
========================================================= */
export interface ValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  email: {
    required: boolean;
    pattern: RegExp;
  };
  password: {
    required: boolean;
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecial: boolean;
  };
  role: {
    required: boolean;
  };
  shift: {
    required: boolean;
  };
}

/* =========================================================
   FORM ACTIONS
   Acciones del formulario
========================================================= */
export interface FormActions {
  setSection: (section: FormSection) => void;
  updateBasic: (data: Partial<BasicFormData>) => void;
  updateRole: (data: Partial<RoleFormData>) => void;
  updateSchedule: (data: Partial<ScheduleFormData>) => void;
  updatePermissions: (data: Partial<PermissionsFormData>) => void;
  updateOAuth: (data: Partial<OAuthFormData>) => void;
  updateAdvanced: (data: Partial<AdvancedFormData>) => void;
  validate: () => boolean;
  validateSection: (section: FormSection) => boolean;
  reset: () => void;
  submit: () => Promise<void>;
}

/* =========================================================
   DEFAULT FORM DATA
   Datos por defecto del formulario
========================================================= */
export const DEFAULT_BASIC_DATA: BasicFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const DEFAULT_ROLE_DATA: RoleFormData = {
  role: "bartender",
  shift: undefined,
  permissions: {},
};

export const DEFAULT_SCHEDULE_DATA: ScheduleFormData = {
  schedule: {},
};

export const DEFAULT_PERMISSIONS_DATA: PermissionsFormData = {
  permissions: {},
  customPermissions: {},
};

export const DEFAULT_ADVANCED_DATA: AdvancedFormData = {
  isActive: true,
  metadata: {},
};

export const DEFAULT_FORM_DATA: CompleteEmployeeFormData = {
  basic: DEFAULT_BASIC_DATA,
  role: DEFAULT_ROLE_DATA,
  schedule: DEFAULT_SCHEDULE_DATA,
  permissions: DEFAULT_PERMISSIONS_DATA,
  advanced: DEFAULT_ADVANCED_DATA,
};

/* =========================================================
   DEFAULT FORM CONFIG
   Configuración por defecto del formulario
========================================================= */
export const DEFAULT_FORM_CONFIG: FormConfig = {
  mode: "create",
  showPassword: true,
  requirePassword: true,
  showSchedule: true,
  showPermissions: true,
  showOAuth: false,
  showAdvanced: true,
  sections: ["basic", "role", "schedule", "permissions", "advanced"],
  validationRules: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 6,
      requireUppercase: false,
      requireLowercase: false,
      requireNumber: false,
      requireSpecial: false,
    },
    role: {
      required: true,
    },
    shift: {
      required: false,
    },
  },
};
