/**
 * WORKSPACE DEFINITION
 * Contrato que representa el Workspace completo
 * Define la estructura de la interfaz que el frontend debe renderizar
 */

/**
 * Tipos de layout disponibles
 */
export const LayoutType = Object.freeze({
  SIDEBAR: 'sidebar',
  TOPBAR: 'topbar',
  MOBILE: 'mobile',
  MINIMAL: 'minimal',
  FULLSCREEN: 'fullscreen',
});

/**
 * Tipos de widgets
 */
export const WidgetType = Object.freeze({
  SALES: 'sales',
  INVENTORY: 'inventory',
  ALERTS: 'alerts',
  ORDERS: 'orders',
  RESERVATIONS: 'reservations',
  ROULETTE: 'roulette',
  FAVORITES: 'favorites',
  WEATHER: 'weather',
  NOTIFICATIONS: 'notifications',
  PERFORMANCE: 'performance',
  ATTENDANCE: 'attendance',
  TABLES: 'tables',
  MENU: 'menu',
});

/**
 * Tipos de navegación
 */
export const NavigationType = Object.freeze({
  SIDEBAR: 'sidebar',
  HEADER: 'header',
  FOOTER: 'footer',
  QUICK_ACTIONS: 'quick_actions',
  MORE_MENU: 'more_menu',
});

/**
 * Tipos de plataforma
 */
export const PlatformType = Object.freeze({
  WEB: 'web',
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
});

/**
 * Definición de un item de navegación
 */
export const createNavigationItem = (config) => ({
  id: config.id,
  label: config.label,
  icon: config.icon || null,
  path: config.path || null,
  type: config.type || NavigationType.SIDEBAR,
  badge: config.badge || null,
  order: config.order || 0,
  permissions: config.permissions || [],
  features: config.features || [],
  children: config.children || [],
  hidden: config.hidden || false,
  disabled: config.disabled || false,
  divider: config.divider || false,
});

/**
 * Definición de un widget
 */
export const createWidget = (config) => ({
  id: config.id,
  type: config.type,
  title: config.title,
  description: config.description || null,
  order: config.order || 0,
  size: config.size || 'medium', // small, medium, large, full
  permissions: config.permissions || [],
  features: config.features || [],
  config: config.config || {},
  refreshInterval: config.refreshInterval || null,
  hidden: config.hidden || false,
  collapsible: config.collapsible !== false,
});

/**
 * Definición de una funcionalidad
 */
export const createFeature = (config) => ({
  id: config.id,
  name: config.name,
  description: config.description || null,
  permissions: config.permissions || [],
  enabled: config.enabled !== false,
  config: config.config || {},
});

/**
 * Definición de un acceso rápido (shortcut)
 */
export const createShortcut = (config) => ({
  id: config.id,
  label: config.label,
  icon: config.icon || null,
  path: config.path || null,
  action: config.action || null,
  permissions: config.permissions || [],
  order: config.order || 0,
  hotkey: config.hotkey || null,
});

/**
 * Definición del Workspace completo
 */
export const createWorkspaceDefinition = (config) => ({
  // Información básica
  userId: config.userId,
  role: config.role,
  platform: config.platform || PlatformType.WEB,
  
  // Layout
  layout: config.layout || LayoutType.SIDEBAR,
  layoutConfig: config.layoutConfig || {},
  
  // Navegación
  navigation: config.navigation || [],
  
  // Widgets
  widgets: config.widgets || [],
  
  // Funcionalidades
  features: config.features || [],
  
  // Accesos rápidos
  shortcuts: config.shortcuts || [],
  
  // Permisos
  permissions: config.permissions || [],
  
  // Tema
  theme: config.theme || 'default',
  
  // Página inicial
  landingPage: config.landingPage || '/',
  
  // Configuración de personalización
  customization: config.customization || {
    theme: null,
    language: null,
    density: null,
    panelSize: null,
    favoriteWidgets: [],
    customOrder: {},
  },
  
  // Metadata
  metadata: config.metadata || {},
});

/**
 * Valida si un Workspace Definition es válido
 */
export const validateWorkspaceDefinition = (workspace) => {
  if (!workspace.userId) return false;
  if (!workspace.role) return false;
  if (!workspace.layout) return false;
  if (!Array.isArray(workspace.navigation)) return false;
  if (!Array.isArray(workspace.widgets)) return false;
  if (!Array.isArray(workspace.features)) return false;
  return true;
};
