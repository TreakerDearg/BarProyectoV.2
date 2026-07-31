/**
 * PERMISSION RESOLVER
 * Resuelve los permisos del usuario basado en su rol
 * El backend es la única fuente de verdad para permisos
 */

/**
 * Permisos del sistema por rol
 */
const ROLE_PERMISSIONS = {
  client: [
    'view_menu',
    'place_order',
    'view_reservations',
    'create_reservation',
    'view_profile',
    'update_profile',
  ],
  bartender: [
    'view_menu',
    'view_orders',
    'update_order_status',
    'view_tables',
    'manage_tables',
    'view_reservations',
    'view_profile',
    'update_profile',
    'check_in',
    'check_out',
  ],
  waiter: [
    'view_menu',
    'view_orders',
    'create_order',
    'update_order_status',
    'view_tables',
    'manage_tables',
    'view_reservations',
    'create_reservation',
    'view_profile',
    'update_profile',
    'check_in',
    'check_out',
  ],
  cashier: [
    'view_menu',
    'view_orders',
    'process_payment',
    'view_tables',
    'view_reservations',
    'view_profile',
    'update_profile',
    'check_in',
    'check_out',
  ],
  kitchen: [
    'view_menu',
    'view_orders',
    'update_order_status',
    'view_profile',
    'update_profile',
    'check_in',
    'check_out',
  ],
  admin: [
    // Todos los permisos de empleados
    'view_menu',
    'view_orders',
    'create_order',
    'update_order_status',
    'process_payment',
    'view_tables',
    'manage_tables',
    'view_reservations',
    'create_reservation',
    'view_profile',
    'update_profile',
    'check_in',
    'check_out',
    // Permisos administrativos
    'manage_users',
    'manage_roles',
    'view_analytics',
    'manage_inventory',
    'manage_menu',
    'view_reports',
    'manage_settings',
    'view_attendance',
    'manage_attendance',
    'view_performance',
  ],
  owner: [
    // Todos los permisos de admin
    'view_menu',
    'view_orders',
    'create_order',
    'update_order_status',
    'process_payment',
    'view_tables',
    'manage_tables',
    'view_reservations',
    'create_reservation',
    'view_profile',
    'update_profile',
    'check_in',
    'check_out',
    'manage_users',
    'manage_roles',
    'view_analytics',
    'manage_inventory',
    'manage_menu',
    'view_reports',
    'manage_settings',
    'view_attendance',
    'manage_attendance',
    'view_performance',
    // Permisos exclusivos del dueño
    'manage_admins',
    'manage_business',
    'view_financials',
    'export_data',
  ],
};

/**
 * Permisos especiales que pueden ser otorgados individualmente
 */
const SPECIAL_PERMISSIONS = [
  'view_analytics',
  'manage_inventory',
  'manage_menu',
  'view_reports',
  'manage_settings',
  'view_attendance',
  'manage_attendance',
  'view_performance',
];

/**
 * Resuelve los permisos del usuario
 * @param {Object} user - Usuario del modelo User
 * @returns {Object} Permisos del usuario
 */
export const resolvePermissions = (user) => {
  const role = user.role || 'client';
  const basePermissions = ROLE_PERMISSIONS[role] || [];
  
  // Permisos personalizados del usuario (si existen)
  const customPermissions = user.permissions || {};
  
  // Combinar permisos base con permisos personalizados
  const finalPermissions = [...basePermissions];
  
  // Agregar permisos especiales otorgados
  Object.keys(customPermissions).forEach(permission => {
    if (customPermissions[permission] && !finalPermissions.includes(permission)) {
      finalPermissions.push(permission);
    }
  });
  
  // Remover permisos revocados
  Object.keys(customPermissions).forEach(permission => {
    if (!customPermissions[permission] && finalPermissions.includes(permission)) {
      const index = finalPermissions.indexOf(permission);
      if (index > -1) {
        finalPermissions.splice(index, 1);
      }
    }
  });
  
  return {
    permissions: finalPermissions,
    role,
    hasCustomPermissions: Object.keys(customPermissions).length > 0,
    customPermissions,
  };
};

/**
 * Verifica si el usuario tiene un permiso específico
 * @param {Object} user - Usuario del modelo User
 * @param {string} permission - Permiso a verificar
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  const { permissions } = resolvePermissions(user);
  return permissions.includes(permission);
};

/**
 * Verifica si el usuario tiene todos los permisos especificados
 * @param {Object} user - Usuario del modelo User
 * @param {Array<string>} permissions - Permisos a verificar
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  const { permissions: userPermissions } = resolvePermissions(user);
  return permissions.every(permission => userPermissions.includes(permission));
};

/**
 * Verifica si el usuario tiene al menos uno de los permisos especificados
 * @param {Object} user - Usuario del modelo User
 * @param {Array<string>} permissions - Permisos a verificar
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  const { permissions: userPermissions } = resolvePermissions(user);
  return permissions.some(permission => userPermissions.includes(permission));
};

/**
 * Verifica si el usuario puede acceder al sistema Desktop
 * @param {Object} user - Usuario del modelo User
 * @returns {boolean}
 */
export const canAccessDesktopSystem = (user) => {
  const role = user.role || 'client';
  const employeeRoles = ['bartender', 'waiter', 'cashier', 'kitchen', 'admin', 'owner'];
  return employeeRoles.includes(role);
};

/**
 * Verifica si el usuario puede acceder al sistema Admin
 * @param {Object} user - Usuario del modelo User
 * @returns {boolean}
 */
export const canAccessAdminSystem = (user) => {
  const role = user.role || 'client';
  return role === 'admin' || role === 'owner';
};

/**
 * Verifica si el usuario puede acceder al sistema Cliente
 * @param {Object} user - Usuario del modelo User
 * @returns {boolean}
 */
export const canAccessClientSystem = (user) => {
  const role = user.role || 'client';
  return role === 'client';
};

/**
 * Obtiene los permisos agrupados por categoría
 * @param {Object} user - Usuario del modelo User
 * @returns {Object} Permisos agrupados
 */
export const getPermissionsByCategory = (user) => {
  const { permissions } = resolvePermissions(user);
  
  const categories = {
    menu: ['view_menu', 'manage_menu'],
    orders: ['view_orders', 'create_order', 'update_order_status'],
    payments: ['process_payment'],
    tables: ['view_tables', 'manage_tables'],
    reservations: ['view_reservations', 'create_reservation'],
    users: ['manage_users', 'manage_roles', 'manage_admins'],
    inventory: ['manage_inventory'],
    analytics: ['view_analytics', 'view_reports', 'view_financials'],
    settings: ['manage_settings', 'manage_business'],
    attendance: ['view_attendance', 'manage_attendance', 'check_in', 'check_out'],
    performance: ['view_performance'],
    profile: ['view_profile', 'update_profile'],
    data: ['export_data'],
  };
  
  const result = {};
  
  Object.keys(categories).forEach(category => {
    result[category] = categories[category].filter(permission => 
      permissions.includes(permission)
    );
  });
  
  return result;
};
