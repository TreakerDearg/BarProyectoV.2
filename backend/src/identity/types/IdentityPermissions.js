/* =========================================================
   IDENTITY PERMISSIONS STRUCTURE
   Permisos granulares por módulo
========================================================= */

/**
 * Módulos del sistema con sus permisos
 */
export const PermissionModules = Object.freeze({
  ORDERS: 'orders',
  INVENTORY: 'inventory',
  KITCHEN: 'kitchen',
  BAR: 'bar',
  RESERVATIONS: 'reservations',
  PAYMENTS: 'payments',
  REPORTS: 'reports',
  EMPLOYEES: 'employees',
  MENUS: 'menus',
  SETTINGS: 'settings',
  TABLES: 'tables',
  DISCOUNTS: 'discounts',
});

/**
 * Acciones disponibles por módulo
 */
export const PermissionActions = Object.freeze({
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage', // CRUD completo
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
});

/**
 * Estructura completa de permisos por módulo
 */
export const PermissionStructure = {
  [PermissionModules.ORDERS]: [
    'orders:create',
    'orders:read',
    'orders:update',
    'orders:delete',
    'orders:approve',
    'orders:reject',
  ],
  [PermissionModules.INVENTORY]: [
    'inventory:read',
    'inventory:update',
    'inventory:manage',
    'inventory:export',
  ],
  [PermissionModules.KITCHEN]: [
    'kitchen:read',
    'kitchen:update',
    'kitchen:manage',
  ],
  [PermissionModules.BAR]: [
    'bar:read',
    'bar:update',
    'bar:manage',
  ],
  [PermissionModules.RESERVATIONS]: [
    'reservations:create',
    'reservations:read',
    'reservations:update',
    'reservations:delete',
    'reservations:approve',
    'reservations:reject',
  ],
  [PermissionModules.PAYMENTS]: [
    'payments:read',
    'payments:process',
    'payments:refund',
    'payments:export',
  ],
  [PermissionModules.REPORTS]: [
    'reports:read',
    'reports:export',
    'reports:manage',
  ],
  [PermissionModules.EMPLOYEES]: [
    'employees:read',
    'employees:create',
    'employees:update',
    'employees:delete',
    'employees:manage',
  ],
  [PermissionModules.MENUS]: [
    'menus:read',
    'menus:create',
    'menus:update',
    'menus:delete',
    'menus:manage',
  ],
  [PermissionModules.SETTINGS]: [
    'settings:read',
    'settings:update',
    'settings:manage',
  ],
  [PermissionModules.TABLES]: [
    'tables:read',
    'tables:create',
    'tables:update',
    'tables:delete',
    'tables:manage',
  ],
  [PermissionModules.DISCOUNTS]: [
    'discounts:read',
    'discounts:create',
    'discounts:update',
    'discounts:delete',
    'discounts:approve',
  ],
};

/**
 * Permisos por defecto por rol
 * Estos permisos se asignan automáticamente al crear un usuario
 */
export const DefaultRolePermissions = {
  [IdentityRole.ADMIN]: Object.values(PermissionStructure).flat(),
  [IdentityRole.OWNER]: Object.values(PermissionStructure).flat(),
  [IdentityRole.MANAGER]: [
    ...PermissionStructure[PermissionModules.ORDERS],
    ...PermissionStructure[PermissionModules.INVENTORY],
    ...PermissionStructure[PermissionModules.RESERVATIONS],
    ...PermissionStructure[PermissionModules.PAYMENTS],
    ...PermissionStructure[PermissionModules.REPORTS],
    ...PermissionStructure[PermissionModules.EMPLOYEES],
    ...PermissionStructure[PermissionModules.MENUS],
    ...PermissionStructure[PermissionModules.TABLES],
    ...PermissionStructure[PermissionModules.DISCOUNTS],
  ],
  [IdentityRole.BARTENDER]: [
    ...PermissionStructure[PermissionModules.ORDERS],
    ...PermissionStructure[PermissionModules.BAR],
    ...PermissionStructure[PermissionModules.INVENTORY],
    'menus:read',
    'tables:read',
  ],
  [IdentityRole.WAITER]: [
    ...PermissionStructure[PermissionModules.ORDERS],
    ...PermissionStructure[PermissionModules.RESERVATIONS],
    ...PermissionStructure[PermissionModules.TABLES],
    'menus:read',
  ],
  [IdentityRole.CASHIER]: [
    ...PermissionStructure[PermissionModules.PAYMENTS],
    ...PermissionStructure[PermissionModules.ORDERS],
    ...PermissionStructure[PermissionModules.REPORTS],
    'tables:read',
  ],
  [IdentityRole.KITCHEN]: [
    ...PermissionStructure[PermissionModules.ORDERS],
    ...PermissionStructure[PermissionModules.KITCHEN],
    ...PermissionStructure[PermissionModules.INVENTORY],
  ],
  [IdentityRole.CLIENT]: [
    'menus:read',
    'reservations:create',
    'reservations:read',
  ],
};

/**
 * Genera un objeto de permisos desde un array
 * @param {string[]} permissions - Array de permisos
 * @returns {Object} Objeto de permisos
 */
export const permissionsToObject = (permissions = []) => {
  const obj = {};
  permissions.forEach(perm => {
    obj[perm] = true;
  });
  return obj;
};

/**
 * Genera un array de permisos desde un objeto
 * @param {Object} permissionsObj - Objeto de permisos
 * @returns {string[]} Array de permisos
 */
export const objectToPermissions = (permissionsObj = {}) => {
  return Object.keys(permissionsObj).filter(key => permissionsObj[key] === true);
};

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {Object} user - Usuario con permisos
 * @param {string} permission - Permiso a verificar
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  return user.permissions[permission] === true;
};

/**
 * Verifica si un usuario tiene todos los permisos especificados
 * @param {Object} user - Usuario con permisos
 * @param {string[]} permissions - Permisos a verificar
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions = []) => {
  return permissions.every(perm => hasPermission(user, perm));
};

/**
 * Verifica si un usuario tiene al menos uno de los permisos especificados
 * @param {Object} user - Usuario con permisos
 * @param {string[]} permissions - Permisos a verificar
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions = []) => {
  return permissions.some(perm => hasPermission(user, perm));
};

/**
 * Obtiene permisos por defecto para un rol
 * @param {string} role - Rol
 * @returns {Object} Objeto de permisos
 */
export const getDefaultPermissionsForRole = (role) => {
  const permissions = DefaultRolePermissions[role] || [];
  return permissionsToObject(permissions);
};
