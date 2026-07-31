/**
 * EMPLOYEE VALIDATION
 * Validaciones centralizadas para formularios de empleados
 */

import type {
  BasicFormData,
  RoleFormData,
  ScheduleFormData,
  PermissionsFormData,
  AdvancedFormData,
  FormValidationErrors,
  ValidationRules,
} from "../types";
import { VALIDATION_CONFIG } from "../constants";

/* =========================================================
   VALIDATION RULES
   Reglas de validación
========================================================= */
export const VALIDATION_RULES: ValidationRules = {
  name: {
    required: true,
    minLength: VALIDATION_CONFIG.NAME_MIN_LENGTH,
    maxLength: VALIDATION_CONFIG.NAME_MAX_LENGTH,
  },
  email: {
    required: true,
    pattern: VALIDATION_CONFIG.EMAIL_PATTERN,
  },
  password: {
    required: true,
    minLength: VALIDATION_CONFIG.PASSWORD_MIN_LENGTH,
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
};

/* =========================================================
   VALIDATE BASIC DATA
   Validación de datos básicos
========================================================= */
export const validateBasicData = (data: BasicFormData, requirePassword: boolean = true): Partial<FormValidationErrors["basic"]> => {
  const errors: Partial<FormValidationErrors["basic"]> = {};

  // Validar nombre
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "El nombre es requerido";
  } else if (data.name.trim().length < VALIDATION_CONFIG.NAME_MIN_LENGTH) {
    errors.name = `El nombre debe tener al menos ${VALIDATION_CONFIG.NAME_MIN_LENGTH} caracteres`;
  } else if (data.name.trim().length > VALIDATION_CONFIG.NAME_MAX_LENGTH) {
    errors.name = `El nombre no puede tener más de ${VALIDATION_CONFIG.NAME_MAX_LENGTH} caracteres`;
  }

  // Validar email
  if (!data.email || data.email.trim().length === 0) {
    errors.email = "El email es requerido";
  } else if (!VALIDATION_CONFIG.EMAIL_PATTERN.test(data.email)) {
    errors.email = "El email no es válido";
  }

  // Validar contraseña (solo si es requerido)
  if (requirePassword) {
    if (!data.password || data.password.length === 0) {
      errors.password = "La contraseña es requerida";
    } else if (data.password.length < VALIDATION_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.password = `La contraseña debe tener al menos ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} caracteres`;
    } else if (data.password.length > VALIDATION_CONFIG.PASSWORD_MAX_LENGTH) {
      errors.password = `La contraseña no puede tener más de ${VALIDATION_CONFIG.PASSWORD_MAX_LENGTH} caracteres`;
    }
  }

  // Validar confirmación de contraseña
  if (data.password && data.confirmPassword !== data.password) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
};

/* =========================================================
   VALIDATE ROLE DATA
   Validación de datos de rol
========================================================= */
export const validateRoleData = (data: RoleFormData): Partial<FormValidationErrors["role"]> => {
  const errors: Partial<FormValidationErrors["role"]> = {};

  // Validar rol
  if (!data.role) {
    errors.role = "El rol es requerido";
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
};

/* =========================================================
   VALIDATE SCHEDULE DATA
   Validación de datos de horario
========================================================= */
export const validateScheduleData = (data: ScheduleFormData): Partial<FormValidationErrors["schedule"]> => {
  const errors: Partial<FormValidationErrors["schedule"]> = {};

  // Validar horario
  if (!data.schedule || Object.keys(data.schedule).length === 0) {
    errors.schedule = "El horario es requerido";
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
};

/* =========================================================
   VALIDATE PERMISSIONS DATA
   Validación de datos de permisos
========================================================= */
export const validatePermissionsData = (data: PermissionsFormData): Partial<FormValidationErrors["permissions"]> => {
  const errors: Partial<FormValidationErrors["permissions"]> = {};

  // Validar permisos
  if (!data.permissions || Object.keys(data.permissions).length === 0) {
    errors.permissions = "Los permisos son requeridos";
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
};

/* =========================================================
   VALIDATE ADVANCED DATA
   Validación de datos avanzados
========================================================= */
export const validateAdvancedData = (data: AdvancedFormData): Partial<FormValidationErrors["advanced"]> => {
  const errors: Partial<FormValidationErrors["advanced"]> = {};

  // Validar estado activo
  if (typeof data.isActive !== "boolean") {
    errors.isActive = "El estado es requerido";
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
};

/* =========================================================
   VALIDATE COMPLETE FORM DATA
   Validación de datos completos del formulario
========================================================= */
export const validateCompleteFormData = (
  data: {
    basic: BasicFormData;
    role: RoleFormData;
    schedule?: ScheduleFormData;
    permissions?: PermissionsFormData;
    advanced: AdvancedFormData;
  },
  options: {
    requirePassword?: boolean;
    requireSchedule?: boolean;
    requirePermissions?: boolean;
  } = {}
): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  const {
    requirePassword = true,
    requireSchedule = false,
    requirePermissions = false,
  } = options;

  // Validar datos básicos
  const basicErrors = validateBasicData(data.basic, requirePassword);
  if (basicErrors) errors.basic = basicErrors;

  // Validar datos de rol
  const roleErrors = validateRoleData(data.role);
  if (roleErrors) errors.role = roleErrors;

  // Validar datos de horario (si es requerido)
  if (requireSchedule && data.schedule) {
    const scheduleErrors = validateScheduleData(data.schedule);
    if (scheduleErrors) errors.schedule = scheduleErrors;
  }

  // Validar datos de permisos (si es requerido)
  if (requirePermissions && data.permissions) {
    const permissionsErrors = validatePermissionsData(data.permissions);
    if (permissionsErrors) errors.permissions = permissionsErrors;
  }

  // Validar datos avanzados
  const advancedErrors = validateAdvancedData(data.advanced);
  if (advancedErrors) errors.advanced = advancedErrors;

  return errors;
};

/* =========================================================
   VALIDATE SECTION
   Validación de una sección específica
========================================================= */
export const validateSection = (
  section: "basic" | "role" | "schedule" | "permissions" | "advanced",
  data: any,
  options: any = {}
): boolean => {
  switch (section) {
    case "basic":
      return !validateBasicData(data, options.requirePassword);
    case "role":
      return !validateRoleData(data);
    case "schedule":
      return !validateScheduleData(data);
    case "permissions":
      return !validatePermissionsData(data);
    case "advanced":
      return !validateAdvancedData(data);
    default:
      return true;
  }
};

/* =========================================================
   PASSWORD STRENGTH
   Cálculo de fortaleza de contraseña
========================================================= */
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return Math.min(strength, 4);
};

export const getPasswordStrengthLabel = (strength: number): string => {
  const labels = ["Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"];
  return labels[strength] || "Desconocido";
};

export const getPasswordStrengthColor = (strength: number): string => {
  const colors = ["red", "orange", "yellow", "green", "emerald"];
  return colors[strength] || "gray";
};
