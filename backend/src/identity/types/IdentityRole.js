/* =========================================================
   IDENTITY ROLE ENUMERATION
   Roles unificados desacoplados de la base de datos
========================================================= */

/**
 * Roles del sistema Bartender
 * Desacoplado del modelo User para flexibilidad
 */
export const IdentityRole = Object.freeze({
  // Administración
  ADMIN: 'admin',
  OWNER: 'owner',
  MANAGER: 'manager',

  // Personal de servicio
  BARTENDER: 'bartender',
  WAITER: 'waiter',
  CASHIER: 'cashier',

  // Cocina
  KITCHEN: 'kitchen',

  // Clientes
  CLIENT: 'client',
});

/**
 * Mapeo de roles a etiquetas legibles
 */
export const RoleLabels = {
  [IdentityRole.ADMIN]: 'Administrador',
  [IdentityRole.OWNER]: 'Propietario',
  [IdentityRole.MANAGER]: 'Gerente',
  [IdentityRole.BARTENDER]: 'Bartender',
  [IdentityRole.WAITER]: 'Mozo',
  [IdentityRole.CASHIER]: 'Caja',
  [IdentityRole.KITCHEN]: 'Cocina',
  [IdentityRole.CLIENT]: 'Cliente',
};

/**
 * Roles de empleados (staff)
 */
export const EmployeeRoles = [
  IdentityRole.ADMIN,
  IdentityRole.OWNER,
  IdentityRole.MANAGER,
  IdentityRole.BARTENDER,
  IdentityRole.WAITER,
  IdentityRole.CASHIER,
  IdentityRole.KITCHEN,
];

/**
 * Roles de administración
 */
export const AdminRoles = [
  IdentityRole.ADMIN,
  IdentityRole.OWNER,
  IdentityRole.MANAGER,
];

/**
 * Roles de servicio al cliente
 */
export const ServiceRoles = [
  IdentityRole.BARTENDER,
  IdentityRole.WAITER,
  IdentityRole.CASHIER,
];

/**
 * Verifica si un rol es de empleado
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
export const isEmployeeRole = (role) => {
  return EmployeeRoles.includes(role);
};

/**
 * Verifica si un rol es de administración
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
export const isAdminRole = (role) => {
  return AdminRoles.includes(role);
};

/**
 * Verifica si un rol es de servicio
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
export const isServiceRole = (role) => {
  return ServiceRoles.includes(role);
};

/**
 * Obtiene la etiqueta legible de un rol
 * @param {string} role - Rol
 * @returns {string} Etiqueta legible
 */
export const getRoleLabel = (role) => {
  return RoleLabels[role] || role;
};

/**
 * Valida si un rol es válido
 * @param {string} role - Rol a validar
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  return Object.values(IdentityRole).includes(role);
};
