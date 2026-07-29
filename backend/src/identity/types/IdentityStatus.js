/* =========================================================
   IDENTITY STATUS ENUMERATION
   Estados de identidad en el sistema Bartender
========================================================= */

/**
 * Estados de identidad del usuario
 * Desacoplado de la base de datos para flexibilidad
 */
export const IdentityStatus = Object.freeze({
  // Clientes
  CLIENT: 'CLIENT',

  // Empleados
  EMPLOYEE: 'EMPLOYEE',
  EMPLOYEE_WORKING: 'EMPLOYEE_WORKING',
  EMPLOYEE_OFF_SHIFT: 'EMPLOYEE_OFF_SHIFT',
  EMPLOYEE_BREAK: 'EMPLOYEE_BREAK',

  // Administración
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',

  // Estados de cuenta
  LOCKED: 'LOCKED',
  INACTIVE: 'INACTIVE',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
});

/**
 * Determina el estado de identidad basado en el usuario
 * @param {Object} user - Usuario del modelo User
 * @returns {string} Estado de identidad
 */
export const determineIdentityStatus = (user) => {
  if (!user.isActive) {
    return IdentityStatus.INACTIVE;
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return IdentityStatus.LOCKED;
  }

  if (!user.isEmployee) {
    return IdentityStatus.CLIENT;
  }

  // Lógica de empleados basada en turno y asistencia
  const attendanceStatus = user.attendance?.currentStatus;
  
  if (attendanceStatus === 'checked-in') {
    return IdentityStatus.EMPLOYEE_WORKING;
  }

  if (attendanceStatus === 'break') {
    return IdentityStatus.EMPLOYEE_BREAK;
  }

  if (attendanceStatus === 'checked-out' || attendanceStatus === 'absent') {
    return IdentityStatus.EMPLOYEE_OFF_SHIFT;
  }

  // Por defecto, empleado fuera de turno
  return IdentityStatus.EMPLOYEE_OFF_SHIFT;
};

/**
 * Verifica si un estado es activo (puede hacer login)
 * @param {string} status - Estado de identidad
 * @returns {boolean}
 */
export const isActiveStatus = (status) => {
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
 * @param {string} status - Estado de identidad
 * @returns {boolean}
 */
export const isEmployeeStatus = (status) => {
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
 * @param {string} status - Estado de identidad
 * @returns {boolean}
 */
export const isAdminStatus = (status) => {
  return status === IdentityStatus.ADMIN || status === IdentityStatus.OWNER;
};
