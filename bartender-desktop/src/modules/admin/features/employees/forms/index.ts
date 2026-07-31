/**
 * EMPLOYEE FORMS INDEX
 * Exportación centralizada de formularios y validaciones del módulo de empleados
 */

export {
  VALIDATION_RULES,
  validateBasicData,
  validateRoleData,
  validateScheduleData,
  validatePermissionsData,
  validateAdvancedData,
  validateCompleteFormData,
  validateSection,
  getPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from "./employeeValidation";

export {
  FORM_SECTIONS,
  FORM_SECTION_LABELS,
  FORM_SECTION_ICONS,
  BASIC_FIELDS,
  ROLE_FIELDS,
  SCHEDULE_FIELDS,
  ADVANCED_FIELDS,
  createFormConfig,
  createFormData,
  getFormSectionOrder,
  isSectionVisible,
  isSectionRequired,
} from "./employeeForm";
