/* =========================================================
   IDENTITY STATUS ENUMERATION
   Estados de identidad en el sistema Bartender
   Compartido entre frontend y backend
========================================================= */

/**
 * Estados de identidad del usuario
 */
export enum IdentityStatus {
  // Clientes
  CLIENT = 'CLIENT',

  // Empleados
  EMPLOYEE = 'EMPLOYEE',
  EMPLOYEE_WORKING = 'EMPLOYEE_WORKING',
  EMPLOYEE_OFF_SHIFT = 'EMPLOYEE_OFF_SHIFT',
  EMPLOYEE_BREAK = 'EMPLOYEE_BREAK',

  // Administración
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',

  // Estados de cuenta
  LOCKED = 'LOCKED',
  INACTIVE = 'INACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

/**
 * Verifica si un estado es activo (puede hacer login)
 */
export const isActiveStatus = (status: IdentityStatus): boolean => {
  const activeStatuses = [
    IdentityStatus.CLIENT,
    IdentityStatus.EMPLOYEE,
    IdentityStatus.EMPLOYEE_WORKING,
    IdentityStatus.EMPLOYEE_OFF_SHIFT,
    IdentityStatus.EMPLOYEE_BREAK,
    IdentityStatus.ADMIN,
    IdentityStatus.OWNER,
  ];
  return activeStatuses.includes(status);
};

/**
 * Verifica si un estado es de empleado
 */
export const isEmployeeStatus = (status: IdentityStatus): boolean => {
  const employeeStatuses = [
    IdentityStatus.EMPLOYEE,
    IdentityStatus.EMPLOYEE_WORKING,
    IdentityStatus.EMPLOYEE_OFF_SHIFT,
    IdentityStatus.EMPLOYEE_BREAK,
  ];
  return employeeStatuses.includes(status);
};

/**
 * Verifica si un estado es de administración
 */
export const isAdminStatus = (status: IdentityStatus): boolean => {
  return status === IdentityStatus.ADMIN || status === IdentityStatus.OWNER;
};
