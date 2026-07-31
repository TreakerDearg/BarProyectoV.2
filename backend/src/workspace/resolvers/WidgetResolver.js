/**
 * WIDGET RESOLVER
 * Resuelve widgets dinámicos basados en rol, permisos y configuración
 */

import { createWidget, WidgetType } from '../types/WorkspaceDefinition.js';

/**
 * Definiciones de widgets por rol
 */
const WIDGET_DEFINITIONS = {
  client: [
    {
      id: 'promotions',
      type: WidgetType.SALES,
      title: 'Promociones',
      description: 'Ofertas especiales disponibles',
      order: 0,
      size: 'large',
      permissions: [],
      config: { type: 'promotions' },
      refreshInterval: 300000, // 5 minutos
    },
    {
      id: 'recent-orders',
      type: WidgetType.ORDERS,
      title: 'Pedidos Recientes',
      description: 'Tus últimos pedidos',
      order: 1,
      size: 'medium',
      permissions: [],
      config: { limit: 5 },
      refreshInterval: 60000, // 1 minuto
    },
    {
      id: 'reservations',
      type: WidgetType.RESERVATIONS,
      title: 'Mis Reservas',
      description: 'Próximas reservas',
      order: 2,
      size: 'medium',
      permissions: ['view_reservations'],
      config: { limit: 3 },
      refreshInterval: 120000, // 2 minutos
    },
    {
      id: 'favorites',
      type: WidgetType.FAVORITES,
      title: 'Favoritos',
      description: 'Bebidas y platos favoritos',
      order: 3,
      size: 'medium',
      permissions: [],
      config: { limit: 6 },
    },
    {
      id: 'roulette',
      type: WidgetType.ROULETTE,
      title: 'Ruleta de Premios',
      description: 'Gira y gana premios',
      order: 4,
      size: 'medium',
      permissions: [],
      config: {},
    },
    {
      id: 'events',
      type: WidgetType.NOTIFICATIONS,
      title: 'Eventos',
      description: 'Próximos eventos especiales',
      order: 5,
      size: 'medium',
      permissions: [],
      config: { limit: 3 },
      refreshInterval: 300000, // 5 minutos
    },
  ],
  bartender: [
    {
      id: 'pending-orders',
      type: WidgetType.ORDERS,
      title: 'Pedidos Pendientes',
      description: 'Pedidos pendientes de preparación',
      order: 0,
      size: 'large',
      permissions: ['view_orders'],
      config: { status: 'pending', limit: 10 },
      refreshInterval: 30000, // 30 segundos
    },
    {
      id: 'drinks-preparation',
      type: WidgetType.ORDERS,
      title: 'Bebidas en Preparación',
      description: 'Bebidas actualmente en preparación',
      order: 1,
      size: 'large',
      permissions: ['view_orders'],
      config: { status: 'preparation', category: 'drinks', limit: 10 },
      refreshInterval: 30000, // 30 segundos
    },
    {
      id: 'urgent-orders',
      type: WidgetType.ORDERS,
      title: 'Comandas Urgentes',
      description: 'Pedidos con alta prioridad',
      order: 2,
      size: 'medium',
      permissions: ['view_orders'],
      config: { priority: 'high', limit: 5 },
      refreshInterval: 15000, // 15 segundos
    },
    {
      id: 'bar-status',
      type: WidgetType.TABLES,
      title: 'Estado de Barra',
      description: 'Estado actual de la barra',
      order: 3,
      size: 'medium',
      permissions: ['view_tables'],
      config: { area: 'bar' },
      refreshInterval: 60000, // 1 minuto
    },
    {
      id: 'attendance',
      type: WidgetType.ATTENDANCE,
      title: 'Mi Asistencia',
      description: 'Estado de mi turno actual',
      order: 50,
      size: 'small',
      permissions: ['check_in'],
      config: {},
      refreshInterval: 60000, // 1 minuto
    },
  ],
  waiter: [
    {
      id: 'my-tables',
      type: WidgetType.TABLES,
      title: 'Mis Mesas',
      description: 'Mesas asignadas a mi',
      order: 0,
      size: 'large',
      permissions: ['view_tables'],
      config: { assigned: true },
      refreshInterval: 30000, // 30 segundos
    },
    {
      id: 'pending-orders',
      type: WidgetType.ORDERS,
      title: 'Pedidos Pendientes',
      description: 'Pedidos pendientes de atención',
      order: 1,
      size: 'large',
      permissions: ['view_orders'],
      config: { status: 'pending', limit: 10 },
      refreshInterval: 30000, // 30 segundos
    },
    {
      id: 'reservations-today',
      type: WidgetType.RESERVATIONS,
      title: 'Reservas de Hoy',
      description: 'Reservas programadas para hoy',
      order: 2,
      size: 'medium',
      permissions: ['view_reservations'],
      config: { today: true, limit: 5 },
      refreshInterval: 120000, // 2 minutos
    },
    {
      id: 'attendance',
      type: WidgetType.ATTENDANCE,
      title: 'Mi Asistencia',
      description: 'Estado de mi turno actual',
      order: 50,
      size: 'small',
      permissions: ['check_in'],
      config: {},
      refreshInterval: 60000, // 1 minuto
    },
  ],
  cashier: [
    {
      id: 'payments-pending',
      type: WidgetType.ORDERS,
      title: 'Pagos Pendientes',
      description: 'Pedidos pendientes de pago',
      order: 0,
      size: 'large',
      permissions: ['view_orders'],
      config: { status: 'ready_for_payment', limit: 10 },
      refreshInterval: 30000, // 30 segundos
    },
    {
      id: 'daily-sales',
      type: WidgetType.SALES,
      title: 'Ventas del Día',
      description: 'Resumen de ventas de hoy',
      order: 1,
      size: 'large',
      permissions: ['view_analytics'],
      config: { period: 'today' },
      refreshInterval: 60000, // 1 minuto
    },
    {
      id: 'cash-register',
      type: WidgetType.SALES,
      title: 'Caja',
      description: 'Estado de caja actual',
      order: 2,
      size: 'medium',
      permissions: ['process_payment'],
      config: {},
      refreshInterval: 60000, // 1 minuto
    },
    {
      id: 'movements',
      type: WidgetType.SALES,
      title: 'Movimientos',
      description: 'Últimos movimientos de caja',
      order: 3,
      size: 'medium',
      permissions: ['process_payment'],
      config: { limit: 5 },
      refreshInterval: 60000, // 1 minuto
    },
    {
      id: 'attendance',
      type: WidgetType.ATTENDANCE,
      title: 'Mi Asistencia',
      description: 'Estado de mi turno actual',
      order: 50,
      size: 'small',
      permissions: ['check_in'],
      config: {},
      refreshInterval: 60000, // 1 minuto
    },
  ],
  kitchen: [
    {
      id: 'active-orders',
      type: WidgetType.ORDERS,
      title: 'Órdenes Activas',
      description: 'Órdenes en preparación',
      order: 0,
      size: 'large',
      permissions: ['view_orders'],
      config: { category: 'food', status: 'preparation', limit: 10 },
      refreshInterval: 30000, // 30 segundos
    },
    {
      id: 'preparation-times',
      type: WidgetType.PERFORMANCE,
      title: 'Tiempos de Preparación',
      description: 'Tiempos promedio de preparación',
      order: 1,
      size: 'medium',
      permissions: ['view_performance'],
      config: { period: 'today' },
      refreshInterval: 120000, // 2 minutos
    },
    {
      id: 'priority-orders',
      type: WidgetType.ORDERS,
      title: 'Órdenes Prioritarias',
      description: 'Órdenes con alta prioridad',
      order: 2,
      size: 'medium',
      permissions: ['view_orders'],
      config: { priority: 'high', category: 'food', limit: 5 },
      refreshInterval: 15000, // 15 segundos
    },
    {
      id: 'attendance',
      type: WidgetType.ATTENDANCE,
      title: 'Mi Asistencia',
      description: 'Estado de mi turno actual',
      order: 50,
      size: 'small',
      permissions: ['check_in'],
      config: {},
      refreshInterval: 60000, // 1 minuto
    },
  ],
  admin: [
    {
      id: 'metrics',
      type: WidgetType.PERFORMANCE,
      title: 'Métricas Generales',
      description: 'Métricas clave del negocio',
      order: 0,
      size: 'large',
      permissions: ['view_analytics'],
      config: { period: 'today' },
      refreshInterval: 120000, // 2 minutos
    },
    {
      id: 'sales-today',
      type: WidgetType.SALES,
      title: 'Ventas de Hoy',
      description: 'Resumen de ventas del día',
      order: 1,
      size: 'medium',
      permissions: ['view_analytics'],
      config: { period: 'today' },
      refreshInterval: 60000, // 1 minuto
    },
    {
      id: 'inventory-alerts',
      type: WidgetType.INVENTORY,
      title: 'Alertas de Inventario',
      description: 'Productos con stock bajo',
      order: 2,
      size: 'medium',
      permissions: ['manage_inventory'],
      config: { threshold: 'low', limit: 5 },
      refreshInterval: 300000, // 5 minutos
    },
    {
      id: 'employees-online',
      type: WidgetType.ATTENDANCE,
      title: 'Empleados en Turno',
      description: 'Empleados actualmente trabajando',
      order: 3,
      size: 'medium',
      permissions: ['view_attendance'],
      config: {},
      refreshInterval: 60000, // 1 minuto
    },
    {
      id: 'recent-alerts',
      type: WidgetType.ALERTS,
      title: 'Alertas Recientes',
      description: 'Alertas del sistema',
      order: 4,
      size: 'medium',
      permissions: ['view_analytics'],
      config: { limit: 5 },
      refreshInterval: 60000, // 1 minuto
    },
  ],
  owner: [
    {
      id: 'metrics',
      type: WidgetType.PERFORMANCE,
      title: 'Métricas Generales',
      description: 'Métricas clave del negocio',
      order: 0,
      size: 'large',
      permissions: ['view_analytics'],
      config: { period: 'today' },
      refreshInterval: 120000, // 2 minutos
    },
    {
      id: 'sales-today',
      type: WidgetType.SALES,
      title: 'Ventas de Hoy',
      description: 'Resumen de ventas del día',
      order: 1,
      size: 'medium',
      permissions: ['view_analytics'],
      config: { period: 'today' },
      refreshInterval: 60000, // 1 minuto
    },
    {
      id: 'financial-summary',
      type: WidgetType.SALES,
      title: 'Resumen Financiero',
      description: 'Resumen financiero del período',
      order: 2,
      size: 'large',
      permissions: ['view_financials'],
      config: { period: 'month' },
      refreshInterval: 300000, // 5 minutos
    },
    {
      id: 'inventory-alerts',
      type: WidgetType.INVENTORY,
      title: 'Alertas de Inventario',
      description: 'Productos con stock bajo',
      order: 3,
      size: 'medium',
      permissions: ['manage_inventory'],
      config: { threshold: 'low', limit: 5 },
      refreshInterval: 300000, // 5 minutos
    },
    {
      id: 'employees-online',
      type: WidgetType.ATTENDANCE,
      title: 'Empleados en Turno',
      description: 'Empleados actualmente trabajando',
      order: 4,
      size: 'medium',
      permissions: ['view_attendance'],
      config: {},
      refreshInterval: 60000, // 1 minuto
    },
    {
      id: 'recent-alerts',
      type: WidgetType.ALERTS,
      title: 'Alertas Recientes',
      description: 'Alertas del sistema',
      order: 5,
      size: 'medium',
      permissions: ['view_analytics'],
      config: { limit: 5 },
      refreshInterval: 60000, // 1 minuto
    },
  ],
};

/**
 * Resuelve widgets basados en rol, permisos y plataforma
 * @param {string} role - Rol del usuario
 * @param {Array<string>} permissions - Permisos del usuario
 * @param {string} platform - Plataforma (web, desktop, mobile)
 * @returns {Array} Widgets disponibles
 */
export const resolveWidgets = (role, permissions = [], platform = 'web') => {
  const definition = WIDGET_DEFINITIONS[role] || WIDGET_DEFINITIONS.client;
  
  // Filtrar widgets basado en permisos
  const filteredWidgets = definition
    .filter(widget => {
      // Si el widget no tiene permisos requeridos, mostrar
      if (!widget.permissions || widget.permissions.length === 0) return true;
      
      // Verificar si el usuario tiene todos los permisos requeridos
      return widget.permissions.every(perm => permissions.includes(perm));
    })
    .map(widget => createWidget(widget))
    .sort((a, b) => a.order - b.order);
  
  return filteredWidgets;
};

/**
 * Resuelve widgets específicos por ID
 * @param {Array<string>} widgetIds - IDs de widgets a resolver
 * @param {string} role - Rol del usuario
 * @param {Array<string>} permissions - Permisos del usuario
 * @returns {Array} Widgets solicitados
 */
export const resolveSpecificWidgets = (widgetIds, role, permissions = []) => {
  const allWidgets = resolveWidgets(role, permissions);
  return allWidgets.filter(widget => widgetIds.includes(widget.id));
};
