/* =========================================================
   IDENTITY PERMISSIONS STRUCTURE
   Permisos granulares por módulo
   Compartido entre frontend y backend
========================================================= */

/**
 * Módulos del sistema con sus permisos
 */
export enum PermissionModules {
  ORDERS = 'orders',
  INVENTORY = 'inventory',
  KITCHEN = 'kitchen',
  BAR = 'bar',
  RESERVATIONS = 'reservations',
  PAYMENTS = 'payments',
  REPORTS = 'reports',
  EMPLOYEES = 'employees',
  MENUS = 'menus',
  SETTINGS = 'settings',
  TABLES = 'tables',
  DISCOUNTS = 'discounts',
}

/**
 * Acciones disponibles por módulo
 */
export enum PermissionActions {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
}

/**
 * Estructura completa de permisos por módulo
 */
export const PermissionStructure: Record<PermissionModules, string[]> = {
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
 * Tipo de permisos (objeto con booleanos)
 */
export type Permissions = Record<string, boolean>;

/**
 * Verifica si un usuario tiene un permiso específico
 */
export const hasPermission = (user: { permissions?: Permissions }, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions[permission] === true;
};

/**
 * Verifica si un usuario tiene todos los permisos especificados
 */
export const hasAllPermissions = (user: { permissions?: Permissions }, permissions: string[]): boolean => {
  return permissions.every(perm => hasPermission(user, perm));
};

/**
 * Verifica si un usuario tiene al menos uno de los permisos especificados
 */
export const hasAnyPermission = (user: { permissions?: Permissions }, permissions: string[]): boolean => {
  return permissions.some(perm => hasPermission(user, perm));
};
