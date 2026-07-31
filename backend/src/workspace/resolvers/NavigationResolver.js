/**
 * NAVIGATION RESOLVER
 * Genera navegación dinámica basada en rol, permisos y plataforma
 */

import { createNavigationItem, NavigationType } from '../types/WorkspaceDefinition.js';

/**
 * Definiciones de navegación por rol
 */
const NAVIGATION_DEFINITIONS = {
  client: [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home',
      path: '/cliente',
      type: NavigationType.SIDEBAR,
      order: 0,
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: 'menu',
      path: '/cliente/carta',
      type: NavigationType.SIDEBAR,
      order: 1,
    },
    {
      id: 'orders',
      label: 'Mis Pedidos',
      icon: 'shopping-bag',
      path: '/cliente/pedido',
      type: NavigationType.SIDEBAR,
      order: 2,
    },
    {
      id: 'reservations',
      label: 'Reservas',
      icon: 'calendar',
      path: '/cliente/reservas',
      type: NavigationType.SIDEBAR,
      order: 3,
    },
    {
      id: 'roulette',
      label: 'Ruleta',
      icon: 'rotate-cw',
      path: '/cliente/ruleta',
      type: NavigationType.SIDEBAR,
      order: 4,
    },
    {
      id: 'account',
      label: 'Mi Cuenta',
      icon: 'user',
      path: '/cliente/cuenta',
      type: NavigationType.SIDEBAR,
      order: 100,
    },
  ],
  bartender: [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home',
      path: '/desktop',
      type: NavigationType.SIDEBAR,
      order: 0,
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: 'shopping-bag',
      path: '/desktop/pedidos',
      type: NavigationType.SIDEBAR,
      order: 1,
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: 'menu',
      path: '/desktop/carta',
      type: NavigationType.SIDEBAR,
      order: 2,
    },
    {
      id: 'tables',
      label: 'Mesas',
      icon: 'grid',
      path: '/desktop/mesas',
      type: NavigationType.SIDEBAR,
      order: 3,
    },
    {
      id: 'reservations',
      label: 'Reservas',
      icon: 'calendar',
      path: '/desktop/reservas',
      type: NavigationType.SIDEBAR,
      order: 4,
    },
    {
      id: 'attendance',
      label: 'Asistencia',
      icon: 'clock',
      path: '/desktop/asistencia',
      type: NavigationType.SIDEBAR,
      order: 50,
    },
    {
      id: 'account',
      label: 'Mi Cuenta',
      icon: 'user',
      path: '/desktop/cuenta',
      type: NavigationType.SIDEBAR,
      order: 100,
    },
  ],
  waiter: [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home',
      path: '/desktop',
      type: NavigationType.SIDEBAR,
      order: 0,
    },
    {
      id: 'tables',
      label: 'Mesas',
      icon: 'grid',
      path: '/desktop/mesas',
      type: NavigationType.SIDEBAR,
      order: 1,
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: 'shopping-bag',
      path: '/desktop/pedidos',
      type: NavigationType.SIDEBAR,
      order: 2,
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: 'menu',
      path: '/desktop/carta',
      type: NavigationType.SIDEBAR,
      order: 3,
    },
    {
      id: 'reservations',
      label: 'Reservas',
      icon: 'calendar',
      path: '/desktop/reservas',
      type: NavigationType.SIDEBAR,
      order: 4,
    },
    {
      id: 'attendance',
      label: 'Asistencia',
      icon: 'clock',
      path: '/desktop/asistencia',
      type: NavigationType.SIDEBAR,
      order: 50,
    },
    {
      id: 'account',
      label: 'Mi Cuenta',
      icon: 'user',
      path: '/desktop/cuenta',
      type: NavigationType.SIDEBAR,
      order: 100,
    },
  ],
  cashier: [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home',
      path: '/desktop',
      type: NavigationType.SIDEBAR,
      order: 0,
    },
    {
      id: 'payments',
      label: 'Pagos',
      icon: 'credit-card',
      path: '/desktop/pagos',
      type: NavigationType.SIDEBAR,
      order: 1,
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: 'shopping-bag',
      path: '/desktop/pedidos',
      type: NavigationType.SIDEBAR,
      order: 2,
    },
    {
      id: 'tables',
      label: 'Mesas',
      icon: 'grid',
      path: '/desktop/mesas',
      type: NavigationType.SIDEBAR,
      order: 3,
    },
    {
      id: 'attendance',
      label: 'Asistencia',
      icon: 'clock',
      path: '/desktop/asistencia',
      type: NavigationType.SIDEBAR,
      order: 50,
    },
    {
      id: 'account',
      label: 'Mi Cuenta',
      icon: 'user',
      path: '/desktop/cuenta',
      type: NavigationType.SIDEBAR,
      order: 100,
    },
  ],
  kitchen: [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home',
      path: '/desktop',
      type: NavigationType.SIDEBAR,
      order: 0,
    },
    {
      id: 'orders',
      label: 'Órdenes',
      icon: 'shopping-bag',
      path: '/desktop/ordenes',
      type: NavigationType.SIDEBAR,
      order: 1,
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: 'menu',
      path: '/desktop/carta',
      type: NavigationType.SIDEBAR,
      order: 2,
    },
    {
      id: 'attendance',
      label: 'Asistencia',
      icon: 'clock',
      path: '/desktop/asistencia',
      type: NavigationType.SIDEBAR,
      order: 50,
    },
    {
      id: 'account',
      label: 'Mi Cuenta',
      icon: 'user',
      path: '/desktop/cuenta',
      type: NavigationType.SIDEBAR,
      order: 100,
    },
  ],
  admin: [
    {
      id: 'home',
      label: 'Dashboard',
      icon: 'layout-dashboard',
      path: '/admin',
      type: NavigationType.SIDEBAR,
      order: 0,
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: 'users',
      path: '/admin/usuarios',
      type: NavigationType.SIDEBAR,
      order: 1,
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: 'shield',
      path: '/admin/roles',
      type: NavigationType.SIDEBAR,
      order: 2,
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: 'package',
      path: '/admin/inventario',
      type: NavigationType.SIDEBAR,
      order: 3,
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: 'menu',
      path: '/admin/menu',
      type: NavigationType.SIDEBAR,
      order: 4,
    },
    {
      id: 'sales',
      label: 'Ventas',
      icon: 'trending-up',
      path: '/admin/ventas',
      type: NavigationType.SIDEBAR,
      order: 5,
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: 'file-text',
      path: '/admin/reportes',
      type: NavigationType.SIDEBAR,
      order: 6,
    },
    {
      id: 'attendance',
      label: 'Asistencia',
      icon: 'clock',
      path: '/admin/asistencia',
      type: NavigationType.SIDEBAR,
      order: 7,
    },
    {
      id: 'performance',
      label: 'Rendimiento',
      icon: 'bar-chart',
      path: '/admin/rendimiento',
      type: NavigationType.SIDEBAR,
      order: 8,
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: 'settings',
      path: '/admin/configuracion',
      type: NavigationType.SIDEBAR,
      order: 100,
    },
  ],
  owner: [
    {
      id: 'home',
      label: 'Dashboard',
      icon: 'layout-dashboard',
      path: '/admin',
      type: NavigationType.SIDEBAR,
      order: 0,
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: 'users',
      path: '/admin/usuarios',
      type: NavigationType.SIDEBAR,
      order: 1,
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: 'shield',
      path: '/admin/roles',
      type: NavigationType.SIDEBAR,
      order: 2,
    },
    {
      id: 'admins',
      label: 'Administradores',
      icon: 'user-crown',
      path: '/admin/administradores',
      type: NavigationType.SIDEBAR,
      order: 3,
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: 'package',
      path: '/admin/inventario',
      type: NavigationType.SIDEBAR,
      order: 4,
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: 'menu',
      path: '/admin/menu',
      type: NavigationType.SIDEBAR,
      order: 5,
    },
    {
      id: 'sales',
      label: 'Ventas',
      icon: 'trending-up',
      path: '/admin/ventas',
      type: NavigationType.SIDEBAR,
      order: 6,
    },
    {
      id: 'financials',
      label: 'Finanzas',
      icon: 'dollar-sign',
      path: '/admin/finanzas',
      type: NavigationType.SIDEBAR,
      order: 7,
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: 'file-text',
      path: '/admin/reportes',
      type: NavigationType.SIDEBAR,
      order: 8,
    },
    {
      id: 'attendance',
      label: 'Asistencia',
      icon: 'clock',
      path: '/admin/asistencia',
      type: NavigationType.SIDEBAR,
      order: 9,
    },
    {
      id: 'performance',
      label: 'Rendimiento',
      icon: 'bar-chart',
      path: '/admin/rendimiento',
      type: NavigationType.SIDEBAR,
      order: 10,
    },
    {
      id: 'business',
      label: 'Negocio',
      icon: 'building',
      path: '/admin/negocio',
      type: NavigationType.SIDEBAR,
      order: 11,
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: 'settings',
      path: '/admin/configuracion',
      type: NavigationType.SIDEBAR,
      order: 100,
    },
  ],
};

/**
 * Resuelve la navegación basada en rol, permisos y plataforma
 * @param {string} role - Rol del usuario
 * @param {Array<string>} permissions - Permisos del usuario
 * @param {string} platform - Plataforma (web, desktop, mobile)
 * @returns {Array} Items de navegación
 */
export const resolveNavigation = (role, permissions = [], platform = 'web') => {
  const definition = NAVIGATION_DEFINITIONS[role] || NAVIGATION_DEFINITIONS.client;
  
  // Filtrar items basado en permisos
  const filteredNavigation = definition
    .filter(item => {
      // Si el item no tiene permisos requeridos, mostrar
      if (!item.permissions || item.permissions.length === 0) return true;
      
      // Verificar si el usuario tiene todos los permisos requeridos
      return item.permissions.every(perm => permissions.includes(perm));
    })
    .map(item => createNavigationItem(item))
    .sort((a, b) => a.order - b.order);
  
  return filteredNavigation;
};

/**
 * Resuelve accesos rápidos (quick actions) basado en rol
 * @param {string} role - Rol del usuario
 * @param {Array<string>} permissions - Permisos del usuario
 * @returns {Array} Accesos rápidos
 */
export const resolveQuickActions = (role, permissions = []) => {
  const quickActions = {
    client: [
      { id: 'quick-order', label: 'Nuevo Pedido', icon: 'plus', path: '/cliente/carta', order: 0 },
      { id: 'quick-reservation', label: 'Reservar', icon: 'calendar-plus', path: '/cliente/reservas', order: 1 },
    ],
    bartender: [
      { id: 'quick-order', label: 'Nueva Orden', icon: 'plus', path: '/desktop/pedidos/nuevo', order: 0 },
      { id: 'quick-table', label: 'Asignar Mesa', icon: 'grid-plus', path: '/desktop/mesas', order: 1 },
    ],
    waiter: [
      { id: 'quick-table', label: 'Ver Mesas', icon: 'grid', path: '/desktop/mesas', order: 0 },
      { id: 'quick-order', label: 'Tomar Pedido', icon: 'plus', path: '/desktop/pedidos/nuevo', order: 1 },
    ],
    cashier: [
      { id: 'quick-payment', label: 'Procesar Pago', icon: 'credit-card', path: '/desktop/pagos', order: 0 },
    ],
    kitchen: [
      { id: 'quick-orders', label: 'Órdenes Activas', icon: 'shopping-bag', path: '/desktop/ordenes', order: 0 },
    ],
    admin: [
      { id: 'quick-user', label: 'Nuevo Usuario', icon: 'user-plus', path: '/admin/usuarios/nuevo', order: 0 },
      { id: 'quick-report', label: 'Ver Reporte', icon: 'file-text', path: '/admin/reportes', order: 1 },
    ],
    owner: [
      { id: 'quick-user', label: 'Nuevo Usuario', icon: 'user-plus', path: '/admin/usuarios/nuevo', order: 0 },
      { id: 'quick-financial', label: 'Ver Finanzas', icon: 'dollar-sign', path: '/admin/finanzas', order: 1 },
    ],
  };
  
  const actions = quickActions[role] || [];
  
  return actions
    .filter(action => {
      if (!action.permissions || action.permissions.length === 0) return true;
      return action.permissions.every(perm => permissions.includes(perm));
    })
    .sort((a, b) => a.order - b.order);
};
