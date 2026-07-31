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
 * @param {Object} shiftInfo - Información de turno (opcional)
 * @returns {string} Estado de identidad
 */
export const determineIdentityStatus = (user, shiftInfo = null) => {
  // Primero verificar estados de cuenta bloqueados
  if (!user.isActive) {
    return IdentityStatus.INACTIVE;
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return IdentityStatus.LOCKED;
  }

  // Verificar si está pendiente de verificación (OAuth)
  if (user.provider !== 'local' && !user.providerVerified) {
    return IdentityStatus.PENDING_VERIFICATION;
  }

  // Roles de administración
  if (user.role === 'admin') {
    return IdentityStatus.ADMIN;
  }

  if (user.role === 'owner') {
    return IdentityStatus.OWNER;
  }

  // Clientes
  if (!user.isEmployee || user.role === 'client') {
    return IdentityStatus.CLIENT;
  }

  // Empleados - verificar estado laboral basado en asistencia y turno
  const attendanceStatus = user.attendance?.currentStatus;
  const hasActiveShift = shiftInfo?.active || false;
  
  if (attendanceStatus === 'checked-in' && hasActiveShift) {
    return IdentityStatus.EMPLOYEE_WORKING;
  }

  if (attendanceStatus === 'break' && hasActiveShift) {
    return IdentityStatus.EMPLOYEE_BREAK;
  }

  // Si está checked-in pero sin turno activo, considerar fuera de turno
  if (attendanceStatus === 'checked-in' && !hasActiveShift) {
    return IdentityStatus.EMPLOYEE_OFF_SHIFT;
  }

  if (attendanceStatus === 'checked-out' || attendanceStatus === 'absent' || attendanceStatus === 'late') {
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
