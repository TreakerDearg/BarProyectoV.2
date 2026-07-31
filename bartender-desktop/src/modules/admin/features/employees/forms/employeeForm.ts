/**
 * EMPLOYEE FORM CONFIG
 * Configuración centralizada de formularios de empleados
 */

import type {
  CompleteEmployeeFormData,
  FormConfig,
  FormSection,
} from "../types";
import {
  DEFAULT_FORM_DATA,
  DEFAULT_FORM_CONFIG,
} from "../types";

/* =========================================================
   FORM SECTIONS
   Secciones del formulario
========================================================= */
export const FORM_SECTIONS: FormSection[] = [
  "basic",
  "role",
  "schedule",
  "permissions",
  "advanced",
];

/* =========================================================
   FORM SECTION LABELS
   Etiquetas de secciones
========================================================= */
export const FORM_SECTION_LABELS: Record<FormSection, string> = {
  basic: "Información Básica",
  role: "Rol y Permisos",
  schedule: "Horario",
  permissions: "Permisos",
  oauth: "OAuth",
  advanced: "Avanzado",
};

/* =========================================================
   FORM SECTION ICONS
   Iconos de secciones
========================================================= */
export const FORM_SECTION_ICONS: Record<FormSection, string> = {
  basic: "user",
  role: "shield",
  schedule: "calendar",
  permissions: "key",
  oauth: "link",
  advanced: "settings",
};

/* =========================================================
   FORM FIELD DEFINITIONS
   Definiciones de campos del formulario
========================================================= */
export const BASIC_FIELDS = [
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre completo del empleado",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "email@ejemplo.com",
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    required: true,
    placeholder: "••••••••",
  },
  {
    name: "confirmPassword",
    label: "Confirmar Contraseña",
    type: "password",
    required: true,
    placeholder: "••••••••",
  },
];

export const ROLE_FIELDS = [
  {
    name: "role",
    label: "Rol",
    type: "select",
    required: true,
    options: [
      { value: "admin", label: "Administrador" },
      { value: "bartender", label: "Bartender" },
      { value: "waiter", label: "Mozo" },
      { value: "cashier", label: "Cajero" },
      { value: "kitchen", label: "Cocina" },
      { value: "owner", label: "Dueño" },
    ],
  },
  {
    name: "shift",
    label: "Turno",
    type: "select",
    required: false,
    options: [
      { value: "morning", label: "Mañana" },
      { value: "afternoon", label: "Tarde" },
      { value: "night", label: "Noche" },
      { value: "event", label: "Evento" },
    ],
  },
];

export const SCHEDULE_FIELDS = [
  {
    name: "monday",
    label: "Lunes",
    type: "schedule-day",
  },
  {
    name: "tuesday",
    label: "Martes",
    type: "schedule-day",
  },
  {
    name: "wednesday",
    label: "Miércoles",
    type: "schedule-day",
  },
  {
    name: "thursday",
    label: "Jueves",
    type: "schedule-day",
  },
  {
    name: "friday",
    label: "Viernes",
    type: "schedule-day",
  },
  {
    name: "saturday",
    label: "Sábado",
    type: "schedule-day",
  },
  {
    name: "sunday",
    label: "Domingo",
    type: "schedule-day",
  },
];

export const ADVANCED_FIELDS = [
  {
    name: "isActive",
    label: "Estado Activo",
    type: "checkbox",
    default: true,
  },
];

/* =========================================================
   FORM CONFIG FACTORY
   Factory para crear configuración de formulario
========================================================= */
export const createFormConfig = (overrides: Partial<FormConfig> = {}): FormConfig => {
  return {
    ...DEFAULT_FORM_CONFIG,
    ...overrides,
  };
};

/* =========================================================
   FORM DATA FACTORY
   Factory para crear datos de formulario
========================================================= */
export const createFormData = (overrides: Partial<CompleteEmployeeFormData> = {}): CompleteEmployeeFormData => {
  return {
    ...DEFAULT_FORM_DATA,
    ...overrides,
  };
};

/* =========================================================
   FORM SECTION ORDER
   Orden de secciones del formulario
========================================================= */
export const getFormSectionOrder = (config: FormConfig): FormSection[] => {
  return config.sections;
};

/* =========================================================
   FORM SECTION VISIBILITY
   Visibilidad de secciones del formulario
========================================================= */
export const isSectionVisible = (section: FormSection, config: FormConfig): boolean => {
  switch (section) {
    case "basic":
      return true;
    case "role":
      return true;
    case "schedule":
      return config.showSchedule;
    case "permissions":
      return config.showPermissions;
    case "advanced":
      return config.showAdvanced;
    default:
      return false;
  }
};

/* =========================================================
   FORM SECTION REQUIRED
   Requerimiento de secciones del formulario
========================================================= */
export const isSectionRequired = (section: FormSection): boolean => {
  switch (section) {
    case "basic":
      return true;
    case "role":
      return true;
    case "schedule":
      return false;
    case "permissions":
      return false;
    case "oauth":
      return false;
    case "advanced":
      return false;
    default:
      return false;
  }
};
