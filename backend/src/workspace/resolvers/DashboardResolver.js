/**
 * DASHBOARD RESOLVER
 * Determina el dashboard inicial basado en rol, permisos y estado laboral
 */

/**
 * Definiciones de dashboard por rol
 */
const DASHBOARD_DEFINITIONS = {
  client: {
    landingPage: '/cliente',
    widgets: [
      {
        id: 'promotions',
        type: 'promotions',
        title: 'Promociones',
        order: 0,
        size: 'large',
      },
      {
        id: 'recent-orders',
        type: 'orders',
        title: 'Pedidos Recientes',
        order: 1,
        size: 'medium',
      },
      {
        id: 'reservations',
        type: 'reservations',
        title: 'Mis Reservas',
        order: 2,
        size: 'medium',
      },
      {
        id: 'favorites',
        type: 'favorites',
        title: 'Favoritos',
        order: 3,
        size: 'medium',
      },
      {
        id: 'roulette',
        type: 'roulette',
        title: 'Ruleta de Premios',
        order: 4,
        size: 'medium',
      },
      {
        id: 'events',
        type: 'events',
        title: 'Eventos',
        order: 5,
        size: 'medium',
      },
    ],
  },
  bartender: {
    landingPage: '/desktop',
    widgets: [
      {
        id: 'pending-orders',
        type: 'orders',
        title: 'Pedidos Pendientes',
        order: 0,
        size: 'large',
        config: { status: 'pending' },
      },
      {
        id: 'drinks-preparation',
        type: 'orders',
        title: 'Bebidas en Preparación',
        order: 1,
        size: 'large',
        config: { status: 'preparation' },
      },
      {
        id: 'urgent-orders',
        type: 'orders',
        title: 'Comandas Urgentes',
        order: 2,
        size: 'medium',
        config: { priority: 'high' },
      },
      {
        id: 'bar-status',
        type: 'tables',
        title: 'Estado de Barra',
        order: 3,
        size: 'medium',
      },
      {
        id: 'attendance',
        type: 'attendance',
        title: 'Mi Asistencia',
        order: 50,
        size: 'small',
      },
    ],
  },
  waiter: {
    landingPage: '/desktop',
    widgets: [
      {
        id: 'my-tables',
        type: 'tables',
        title: 'Mis Mesas',
        order: 0,
        size: 'large',
      },
      {
        id: 'pending-orders',
        type: 'orders',
        title: 'Pedidos Pendientes',
        order: 1,
        size: 'large',
      },
      {
        id: 'reservations-today',
        type: 'reservations',
        title: 'Reservas de Hoy',
        order: 2,
        size: 'medium',
      },
      {
        id: 'attendance',
        type: 'attendance',
        title: 'Mi Asistencia',
        order: 50,
        size: 'small',
      },
    ],
  },
  cashier: {
    landingPage: '/desktop',
    widgets: [
      {
        id: 'payments-pending',
        type: 'payments',
        title: 'Pagos Pendientes',
        order: 0,
        size: 'large',
      },
      {
        id: 'daily-sales',
        type: 'sales',
        title: 'Ventas del Día',
        order: 1,
        size: 'large',
      },
      {
        id: 'cash-register',
        type: 'cash',
        title: 'Caja',
        order: 2,
        size: 'medium',
      },
      {
        id: 'movements',
        type: 'movements',
        title: 'Movimientos',
        order: 3,
        size: 'medium',
      },
      {
        id: 'attendance',
        type: 'attendance',
        title: 'Mi Asistencia',
        order: 50,
        size: 'small',
      },
    ],
  },
  kitchen: {
    landingPage: '/desktop',
    widgets: [
      {
        id: 'active-orders',
        type: 'orders',
        title: 'Órdenes Activas',
        order: 0,
        size: 'large',
        config: { category: 'food' },
      },
      {
        id: 'preparation-times',
        type: 'performance',
        title: 'Tiempos de Preparación',
        order: 1,
        size: 'medium',
      },
      {
        id: 'priority-orders',
        type: 'orders',
        title: 'Órdenes Prioritarias',
        order: 2,
        size: 'medium',
        config: { priority: 'high' },
      },
      {
        id: 'attendance',
        type: 'attendance',
        title: 'Mi Asistencia',
        order: 50,
        size: 'small',
      },
    ],
  },
  admin: {
    landingPage: '/admin',
    widgets: [
      {
        id: 'metrics',
        type: 'performance',
        title: 'Métricas Generales',
        order: 0,
        size: 'large',
      },
      {
        id: 'sales-today',
        type: 'sales',
        title: 'Ventas de Hoy',
        order: 1,
        size: 'medium',
      },
      {
        id: 'inventory-alerts',
        type: 'inventory',
        title: 'Alertas de Inventario',
        order: 2,
        size: 'medium',
      },
      {
        id: 'employees-online',
        type: 'attendance',
        title: 'Empleados en Turno',
        order: 3,
        size: 'medium',
      },
      {
        id: 'recent-alerts',
        type: 'alerts',
        title: 'Alertas Recientes',
        order: 4,
        size: 'medium',
      },
    ],
  },
  owner: {
    landingPage: '/admin',
    widgets: [
      {
        id: 'metrics',
        type: 'performance',
        title: 'Métricas Generales',
        order: 0,
        size: 'large',
      },
      {
        id: 'sales-today',
        type: 'sales',
        title: 'Ventas de Hoy',
        order: 1,
        size: 'medium',
      },
      {
        id: 'financial-summary',
        type: 'financials',
        title: 'Resumen Financiero',
        order: 2,
        size: 'large',
      },
      {
        id: 'inventory-alerts',
        type: 'inventory',
        title: 'Alertas de Inventario',
        order: 3,
        size: 'medium',
      },
      {
        id: 'employees-online',
        type: 'attendance',
        title: 'Empleados en Turno',
        order: 4,
        size: 'medium',
      },
      {
        id: 'recent-alerts',
        type: 'alerts',
        title: 'Alertas Recientes',
        order: 5,
        size: 'medium',
      },
    ],
  },
};

/**
 * Resuelve el dashboard basado en rol y permisos
 * @param {string} role - Rol del usuario
 * @param {Array<string>} permissions - Permisos del usuario
 * @param {Object} shiftInfo - Información del turno (opcional)
 * @returns {Object} Configuración del dashboard
 */
export const resolveDashboard = (role, permissions = [], shiftInfo = null) => {
  const definition = DASHBOARD_DEFINITIONS[role] || DASHBOARD_DEFINITIONS.client;
  
  // Filtrar widgets basado en permisos
  const filteredWidgets = definition.widgets
    .filter(widget => {
      // Si el widget no tiene permisos requeridos, mostrar
      if (!widget.permissions || widget.permissions.length === 0) return true;
      
      // Verificar si el usuario tiene todos los permisos requeridos
      return widget.permissions.every(perm => permissions.includes(perm));
    })
    .map(widget => ({
      ...widget,
      hidden: false,
      collapsible: true,
    }))
    .sort((a, b) => a.order - b.order);
  
  return {
    landingPage: definition.landingPage,
    widgets: filteredWidgets,
  };
};

/**
 * Resuelve la página inicial basado en rol y estado laboral
 * @param {string} role - Rol del usuario
 * @param {string} identityStatus - Estado de identidad
 * @param {Object} shiftInfo - Información del turno
 * @returns {string} Página inicial
 */
export const resolveLandingPage = (role, identityStatus, shiftInfo = null) => {
  // Empleados fuera de turno
  if (identityStatus === 'EMPLOYEE_OFF_SHIFT') {
    return '/auth/off-shift';
  }
  
  // Empleados en turno
  if (identityStatus === 'EMPLOYEE_WORKING' || identityStatus === 'EMPLOYEE_BREAK') {
    return '/desktop';
  }
  
  // Administradores
  if (role === 'admin' || role === 'owner') {
    return '/admin';
  }
  
  // Clientes
  return '/cliente';
};
