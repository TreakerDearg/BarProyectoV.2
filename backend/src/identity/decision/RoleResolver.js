/**
 * ROLE RESOLVER
 * Resuelve y valida el rol del usuario
 * Determina si el rol es válido y activo
 */

/**
 * Roles disponibles en el sistema
 */
export const ROLES = {
  CLIENT: 'client',
  BARTENDER: 'bartender',
  WAITER: 'waiter',
  CASHIER: 'cashier',
  KITCHEN: 'kitchen',
  ADMIN: 'admin',
  OWNER: 'owner',
};

/**
 * Roles de empleados
 */
export const EMPLOYEE_ROLES = [
  ROLES.BARTENDER,
  ROLES.WAITER,
  ROLES.CASHIER,
  ROLES.KITCHEN,
];

/**
 * Roles de administración
 */
export const ADMIN_ROLES = [
  ROLES.ADMIN,
  ROLES.OWNER,
];

/**
 * Verifica si un rol es válido
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

/**
 * Verifica si el rol es de empleado
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
export const isEmployeeRole = (role) => {
  return EMPLOYEE_ROLES.includes(role);
};

/**
 * Verifica si el rol es de administración
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
export const isAdminRole = (role) => {
  return ADMIN_ROLES.includes(role);
};

/**
 * Resuelve la información del rol del usuario
 * @param {Object} user - Usuario del modelo User
 * @returns {Object} Información del rol
 */
export const resolveRole = (user) => {
  const role = user.role || ROLES.CLIENT;
  
  return {
    role,
    isValid: isValidRole(role),
    isEmployee: isEmployeeRole(role),
    isAdmin: isAdminRole(role),
    isClient: role === ROLES.CLIENT,
    isOwner: role === ROLES.OWNER,
    label: getRoleLabel(role),
    description: getRoleDescription(role),
  };
};

/**
 * Obtiene el label legible del rol
 * @param {string} role - Rol
 * @returns {string} Label del rol
 */
const getRoleLabel = (role) => {
  const labels = {
    [ROLES.CLIENT]: 'Cliente',
    [ROLES.BARTENDER]: 'Bartender',
    [ROLES.WAITER]: 'Mozo',
    [ROLES.CASHIER]: 'Cajero',
    [ROLES.KITCHEN]: 'Cocina',
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.OWNER]: 'Dueño',
  };
  return labels[role] || 'Desconocido';
};

/**
 * Obtiene la descripción del rol
 * @param {string} role - Rol
 * @returns {string} Descripción del rol
 */
const getRoleDescription = (role) => {
  const descriptions = {
    [ROLES.CLIENT]: 'Usuario del sistema cliente',
    [ROLES.BARTENDER]: 'Encargado de preparar bebidas y cócteles',
    [ROLES.WAITER]: 'Encargado de atender mesas y tomar pedidos',
    [ROLES.CASHIER]: 'Encargado de procesar pagos',
    [ROLES.KITCHEN]: 'Encargado de preparar alimentos',
    [ROLES.ADMIN]: 'Administrador del sistema',
    [ROLES.OWNER]: 'Dueño del negocio',
  };
  return descriptions[role] || 'Rol desconocido';
};

/**
 * Valida si el usuario puede tener el rol especificado
 * @param {Object} user - Usuario del modelo User
 * @param {string} role - Rol a validar
 * @returns {boolean}
 */
export const canHaveRole = (user, role) => {
  // Si el usuario ya tiene el rol, es válido
  if (user.role === role) return true;
  
  // Clientes solo pueden ser clientes
  if (!user.isEmployee && role !== ROLES.CLIENT) return false;
  
  // Empleados pueden tener roles de empleados
  if (user.isEmployee && isEmployeeRole(role)) return true;
  
  // Solo administradores pueden tener roles de administración
  if (isAdminRole(role)) {
    return user.role === ROLES.ADMIN || user.role === ROLES.OWNER;
  }
  
  return false;
};
