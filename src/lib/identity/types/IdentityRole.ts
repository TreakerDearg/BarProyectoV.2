/* =========================================================
   IDENTITY ROLE ENUMERATION
   Roles unificados desacoplados de la base de datos
   Compartido entre frontend y backend
========================================================= */

/**
 * Roles del sistema Bartender
 */
export enum IdentityRole {
  // Administración
  ADMIN = 'admin',
  OWNER = 'owner',
  MANAGER = 'manager',

  // Personal de servicio
  BARTENDER = 'bartender',
  WAITER = 'waiter',
  CASHIER = 'cashier',

  // Cocina
  KITCHEN = 'kitchen',

  // Clientes
  CLIENT = 'client',
}

/**
 * Mapeo de roles a etiquetas legibles
 */
export const RoleLabels: Record<IdentityRole, string> = {
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
export const EmployeeRoles: IdentityRole[] = [
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
export const AdminRoles: IdentityRole[] = [
  IdentityRole.ADMIN,
  IdentityRole.OWNER,
  IdentityRole.MANAGER,
];

/**
 * Roles de servicio al cliente
 */
export const ServiceRoles: IdentityRole[] = [
  IdentityRole.BARTENDER,
  IdentityRole.WAITER,
  IdentityRole.CASHIER,
];

/**
 * Verifica si un rol es de empleado
 */
export const isEmployeeRole = (role: IdentityRole): boolean => {
  return EmployeeRoles.includes(role);
};

/**
 * Verifica si un rol es de administración
 */
export const isAdminRole = (role: IdentityRole): boolean => {
  return AdminRoles.includes(role);
};

/**
 * Verifica si un rol es de servicio
 */
export const isServiceRole = (role: IdentityRole): boolean => {
  return ServiceRoles.includes(role);
};

/**
 * Obtiene la etiqueta legible de un rol
 */
export const getRoleLabel = (role: IdentityRole): string => {
  return RoleLabels[role] || role;
};
