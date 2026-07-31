/**
 * FEATURE RESOLVER
 * Habilita funcionalidades dinámicas basadas en rol y permisos
 */

/**
 * Definiciones de funcionalidades por rol
 */
const FEATURE_DEFINITIONS = {
  client: [
    {
      id: 'view-menu',
      name: 'Ver Menú',
      permissions: ['view_menu'],
      enabled: true,
    },
    {
      id: 'place-order',
      name: 'Realizar Pedido',
      permissions: ['place_order'],
      enabled: true,
    },
    {
      id: 'view-reservations',
      name: 'Ver Reservas',
      permissions: ['view_reservations'],
      enabled: true,
    },
    {
      id: 'create-reservation',
      name: 'Crear Reserva',
      permissions: ['create_reservation'],
      enabled: true,
    },
    {
      id: 'view-orders',
      name: 'Ver Pedidos',
      permissions: [],
      enabled: true,
    },
    {
      id: 'use-roulette',
      name: 'Usar Ruleta',
      permissions: [],
      enabled: true,
    },
    {
      id: 'manage-favorites',
      name: 'Gestionar Favoritos',
      permissions: [],
      enabled: true,
    },
    {
      id: 'view-profile',
      name: 'Ver Perfil',
      permissions: ['view_profile'],
      enabled: true,
    },
    {
      id: 'update-profile',
      name: 'Actualizar Perfil',
      permissions: ['update_profile'],
      enabled: true,
    },
  ],
  bartender: [
    {
      id: 'view-menu',
      name: 'Ver Menú',
      permissions: ['view_menu'],
      enabled: true,
    },
    {
      id: 'view-orders',
      name: 'Ver Pedidos',
      permissions: ['view_orders'],
      enabled: true,
    },
    {
      id: 'update-order-status',
      name: 'Actualizar Estado de Pedido',
      permissions: ['update_order_status'],
      enabled: true,
    },
    {
      id: 'view-tables',
      name: 'Ver Mesas',
      permissions: ['view_tables'],
      enabled: true,
    },
    {
      id: 'manage-tables',
      name: 'Gestionar Mesas',
      permissions: ['manage_tables'],
      enabled: true,
    },
    {
      id: 'view-reservations',
      name: 'Ver Reservas',
      permissions: ['view_reservations'],
      enabled: true,
    },
    {
      id: 'view-profile',
      name: 'Ver Perfil',
      permissions: ['view_profile'],
      enabled: true,
    },
    {
      id: 'update-profile',
      name: 'Actualizar Perfil',
      permissions: ['update_profile'],
      enabled: true,
    },
    {
      id: 'check-in',
      name: 'Registrar Entrada',
      permissions: ['check_in'],
      enabled: true,
    },
    {
      id: 'check-out',
      name: 'Registrar Salida',
      permissions: ['check_out'],
      enabled: true,
    },
  ],
  waiter: [
    {
      id: 'view-menu',
      name: 'Ver Menú',
      permissions: ['view_menu'],
      enabled: true,
    },
    {
      id: 'view-orders',
      name: 'Ver Pedidos',
      permissions: ['view_orders'],
      enabled: true,
    },
    {
      id: 'create-order',
      name: 'Crear Pedido',
      permissions: ['create_order'],
      enabled: true,
    },
    {
      id: 'update-order-status',
      name: 'Actualizar Estado de Pedido',
      permissions: ['update_order_status'],
      enabled: true,
    },
    {
      id: 'view-tables',
      name: 'Ver Mesas',
      permissions: ['view_tables'],
      enabled: true,
    },
    {
      id: 'manage-tables',
      name: 'Gestionar Mesas',
      permissions: ['manage_tables'],
      enabled: true,
    },
    {
      id: 'view-reservations',
      name: 'Ver Reservas',
      permissions: ['view_reservations'],
      enabled: true,
    },
    {
      id: 'create-reservation',
      name: 'Crear Reserva',
      permissions: ['create_reservation'],
      enabled: true,
    },
    {
      id: 'view-profile',
      name: 'Ver Perfil',
      permissions: ['view_profile'],
      enabled: true,
    },
    {
      id: 'update-profile',
      name: 'Actualizar Perfil',
      permissions: ['update_profile'],
      enabled: true,
    },
    {
      id: 'check-in',
      name: 'Registrar Entrada',
      permissions: ['check_in'],
      enabled: true,
    },
    {
      id: 'check-out',
      name: 'Registrar Salida',
      permissions: ['check_out'],
      enabled: true,
    },
  ],
  cashier: [
    {
      id: 'view-menu',
      name: 'Ver Menú',
      permissions: ['view_menu'],
      enabled: true,
    },
    {
      id: 'view-orders',
      name: 'Ver Pedidos',
      permissions: ['view_orders'],
      enabled: true,
    },
    {
      id: 'process-payment',
      name: 'Procesar Pago',
      permissions: ['process_payment'],
      enabled: true,
    },
    {
      id: 'view-tables',
      name: 'Ver Mesas',
      permissions: ['view_tables'],
      enabled: true,
    },
    {
      id: 'view-reservations',
      name: 'Ver Reservas',
      permissions: ['view_reservations'],
      enabled: true,
    },
    {
      id: 'view-profile',
      name: 'Ver Perfil',
      permissions: ['view_profile'],
      enabled: true,
    },
    {
      id: 'update-profile',
      name: 'Actualizar Perfil',
      permissions: ['update_profile'],
      enabled: true,
    },
    {
      id: 'check-in',
      name: 'Registrar Entrada',
      permissions: ['check_in'],
      enabled: true,
    },
    {
      id: 'check-out',
      name: 'Registrar Salida',
      permissions: ['check_out'],
      enabled: true,
    },
  ],
  kitchen: [
    {
      id: 'view-menu',
      name: 'Ver Menú',
      permissions: ['view_menu'],
      enabled: true,
    },
    {
      id: 'view-orders',
      name: 'Ver Órdenes',
      permissions: ['view_orders'],
      enabled: true,
    },
    {
      id: 'update-order-status',
      name: 'Actualizar Estado de Orden',
      permissions: ['update_order_status'],
      enabled: true,
    },
    {
      id: 'view-profile',
      name: 'Ver Perfil',
      permissions: ['view_profile'],
      enabled: true,
    },
    {
      id: 'update-profile',
      name: 'Actualizar Perfil',
      permissions: ['update_profile'],
      enabled: true,
    },
    {
      id: 'check-in',
      name: 'Registrar Entrada',
      permissions: ['check_in'],
      enabled: true,
    },
    {
      id: 'check-out',
      name: 'Registrar Salida',
      permissions: ['check_out'],
      enabled: true,
    },
  ],
  admin: [
    {
      id: 'view-menu',
      name: 'Ver Menú',
      permissions: ['view_menu'],
      enabled: true,
    },
    {
      id: 'view-orders',
      name: 'Ver Pedidos',
      permissions: ['view_orders'],
      enabled: true,
    },
    {
      id: 'create-order',
      name: 'Crear Pedido',
      permissions: ['create_order'],
      enabled: true,
    },
    {
      id: 'update-order-status',
      name: 'Actualizar Estado de Pedido',
      permissions: ['update_order_status'],
      enabled: true,
    },
    {
      id: 'process-payment',
      name: 'Procesar Pago',
      permissions: ['process_payment'],
      enabled: true,
    },
    {
      id: 'view-tables',
      name: 'Ver Mesas',
      permissions: ['view_tables'],
      enabled: true,
    },
    {
      id: 'manage-tables',
      name: 'Gestionar Mesas',
      permissions: ['manage_tables'],
      enabled: true,
    },
    {
      id: 'view-reservations',
      name: 'Ver Reservas',
      permissions: ['view_reservations'],
      enabled: true,
    },
    {
      id: 'create-reservation',
      name: 'Crear Reserva',
      permissions: ['create_reservation'],
      enabled: true,
    },
    {
      id: 'view-profile',
      name: 'Ver Perfil',
      permissions: ['view_profile'],
      enabled: true,
    },
    {
      id: 'update-profile',
      name: 'Actualizar Perfil',
      permissions: ['update_profile'],
      enabled: true,
    },
    {
      id: 'check-in',
      name: 'Registrar Entrada',
      permissions: ['check_in'],
      enabled: true,
    },
    {
      id: 'check-out',
      name: 'Registrar Salida',
      permissions: ['check_out'],
      enabled: true,
    },
    {
      id: 'manage-users',
      name: 'Gestionar Usuarios',
      permissions: ['manage_users'],
      enabled: true,
    },
    {
      id: 'manage-roles',
      name: 'Gestionar Roles',
      permissions: ['manage_roles'],
      enabled: true,
    },
    {
      id: 'view-analytics',
      name: 'Ver Analíticas',
      permissions: ['view_analytics'],
      enabled: true,
    },
    {
      id: 'manage-inventory',
      name: 'Gestionar Inventario',
      permissions: ['manage_inventory'],
      enabled: true,
    },
    {
      id: 'manage-menu',
      name: 'Gestionar Menú',
      permissions: ['manage_menu'],
      enabled: true,
    },
    {
      id: 'view-reports',
      name: 'Ver Reportes',
      permissions: ['view_reports'],
      enabled: true,
    },
    {
      id: 'manage-settings',
      name: 'Gestionar Configuración',
      permissions: ['manage_settings'],
      enabled: true,
    },
    {
      id: 'view-attendance',
      name: 'Ver Asistencia',
      permissions: ['view_attendance'],
      enabled: true,
    },
    {
      id: 'manage-attendance',
      name: 'Gestionar Asistencia',
      permissions: ['manage_attendance'],
      enabled: true,
    },
    {
      id: 'view-performance',
      name: 'Ver Rendimiento',
      permissions: ['view_performance'],
      enabled: true,
    },
  ],
  owner: [
    {
      id: 'view-menu',
      name: 'Ver Menú',
      permissions: ['view_menu'],
      enabled: true,
    },
    {
      id: 'view-orders',
      name: 'Ver Pedidos',
      permissions: ['view_orders'],
      enabled: true,
    },
    {
      id: 'create-order',
      name: 'Crear Pedido',
      permissions: ['create_order'],
      enabled: true,
    },
    {
      id: 'update-order-status',
      name: 'Actualizar Estado de Pedido',
      permissions: ['update_order_status'],
      enabled: true,
    },
    {
      id: 'process-payment',
      name: 'Procesar Pago',
      permissions: ['process_payment'],
      enabled: true,
    },
    {
      id: 'view-tables',
      name: 'Ver Mesas',
      permissions: ['view_tables'],
      enabled: true,
    },
    {
      id: 'manage-tables',
      name: 'Gestionar Mesas',
      permissions: ['manage_tables'],
      enabled: true,
    },
    {
      id: 'view-reservations',
      name: 'Ver Reservas',
      permissions: ['view_reservations'],
      enabled: true,
    },
    {
      id: 'create-reservation',
      name: 'Crear Reserva',
      permissions: ['create_reservation'],
      enabled: true,
    },
    {
      id: 'view-profile',
      name: 'Ver Perfil',
      permissions: ['view_profile'],
      enabled: true,
    },
    {
      id: 'update-profile',
      name: 'Actualizar Perfil',
      permissions: ['update_profile'],
      enabled: true,
    },
    {
      id: 'check-in',
      name: 'Registrar Entrada',
      permissions: ['check_in'],
      enabled: true,
    },
    {
      id: 'check-out',
      name: 'Registrar Salida',
      permissions: ['check_out'],
      enabled: true,
    },
    {
      id: 'manage-users',
      name: 'Gestionar Usuarios',
      permissions: ['manage_users'],
      enabled: true,
    },
    {
      id: 'manage-roles',
      name: 'Gestionar Roles',
      permissions: ['manage_roles'],
      enabled: true,
    },
    {
      id: 'manage-admins',
      name: 'Gestionar Administradores',
      permissions: ['manage_admins'],
      enabled: true,
    },
    {
      id: 'view-analytics',
      name: 'Ver Analíticas',
      permissions: ['view_analytics'],
      enabled: true,
    },
    {
      id: 'manage-inventory',
      name: 'Gestionar Inventario',
      permissions: ['manage_inventory'],
      enabled: true,
    },
    {
      id: 'manage-menu',
      name: 'Gestionar Menú',
      permissions: ['manage_menu'],
      enabled: true,
    },
    {
      id: 'view-reports',
      name: 'Ver Reportes',
      permissions: ['view_reports'],
      enabled: true,
    },
    {
      id: 'manage-settings',
      name: 'Gestionar Configuración',
      permissions: ['manage_settings'],
      enabled: true,
    },
    {
      id: 'view-attendance',
      name: 'Ver Asistencia',
      permissions: ['view_attendance'],
      enabled: true,
    },
    {
      id: 'manage-attendance',
      name: 'Gestionar Asistencia',
      permissions: ['manage_attendance'],
      enabled: true,
    },
    {
      id: 'view-performance',
      name: 'Ver Rendimiento',
      permissions: ['view_performance'],
      enabled: true,
    },
    {
      id: 'manage-business',
      name: 'Gestionar Negocio',
      permissions: ['manage_business'],
      enabled: true,
    },
    {
      id: 'view-financials',
      name: 'Ver Finanzas',
      permissions: ['view_financials'],
      enabled: true,
    },
    {
      id: 'export-data',
      name: 'Exportar Datos',
      permissions: ['export_data'],
      enabled: true,
    },
  ],
};

/**
 * Resuelve las funcionalidades basadas en rol y permisos
 * @param {string} role - Rol del usuario
 * @param {Array<string>} permissions - Permisos del usuario
 * @returns {Array} Funcionalidades disponibles
 */
export const resolveFeatures = (role, permissions = []) => {
  const definition = FEATURE_DEFINITIONS[role] || FEATURE_DEFINITIONS.client;
  
  // Filtrar funcionalidades basado en permisos
  const filteredFeatures = definition
    .filter(feature => {
      // Si la funcionalidad no tiene permisos requeridos, mostrar
      if (!feature.permissions || feature.permissions.length === 0) return true;
      
      // Verificar si el usuario tiene todos los permisos requeridos
      return feature.permissions.every(perm => permissions.includes(perm));
    })
    .map(feature => ({
      id: feature.id,
      name: feature.name,
      description: feature.description || null,
      permissions: feature.permissions,
      enabled: feature.enabled,
      config: feature.config || {},
    }));
  
  return filteredFeatures;
};

/**
 * Verifica si una funcionalidad está disponible para el usuario
 * @param {string} featureId - ID de la funcionalidad
 * @param {string} role - Rol del usuario
 * @param {Array<string>} permissions - Permisos del usuario
 * @returns {boolean}
 */
export const hasFeature = (featureId, role, permissions = []) => {
  const features = resolveFeatures(role, permissions);
  return features.some(feature => feature.id === featureId && feature.enabled);
};
