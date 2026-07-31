/**
 * WORKSPACE DEFINITION TYPES
 * Tipos TypeScript para el Workspace Builder
 * Compartidos entre frontend y backend
 */

/**
 * Tipos de layout disponibles
 */
export enum LayoutType {
  SIDEBAR = 'sidebar',
  TOPBAR = 'topbar',
  MOBILE = 'mobile',
  MINIMAL = 'minimal',
  FULLSCREEN = 'fullscreen',
}

/**
 * Tipos de widgets
 */
export enum WidgetType {
  SALES = 'sales',
  INVENTORY = 'inventory',
  ALERTS = 'alerts',
  ORDERS = 'orders',
  RESERVATIONS = 'reservations',
  ROULETTE = 'roulette',
  FAVORITES = 'favorites',
  WEATHER = 'weather',
  NOTIFICATIONS = 'notifications',
  PERFORMANCE = 'performance',
  ATTENDANCE = 'attendance',
  TABLES = 'tables',
  MENU = 'menu',
}

/**
 * Tipos de navegación
 */
export enum NavigationType {
  SIDEBAR = 'sidebar',
  HEADER = 'header',
  FOOTER = 'footer',
  QUICK_ACTIONS = 'quick_actions',
  MORE_MENU = 'more_menu',
}

/**
 * Tipos de plataforma
 */
export enum PlatformType {
  WEB = 'web',
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
}

/**
 * Item de navegación
 */
export interface NavigationItem {
  id: string;
  label: string;
  icon: string | null;
  path: string | null;
  type: NavigationType;
  badge: string | null;
  order: number;
  permissions: string[];
  features: string[];
  children: NavigationItem[];
  hidden: boolean;
  disabled: boolean;
  divider: boolean;
}

/**
 * Widget
 */
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description: string | null;
  order: number;
  size: 'small' | 'medium' | 'large' | 'full';
  permissions: string[];
  features: string[];
  config: Record<string, any>;
  refreshInterval: number | null;
  hidden: boolean;
  collapsible: boolean;
}

/**
 * Funcionalidad
 */
export interface Feature {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  enabled: boolean;
  config: Record<string, any>;
}

/**
 * Acceso rápido (shortcut)
 */
export interface Shortcut {
  id: string;
  label: string;
  icon: string | null;
  path: string | null;
  action: string | null;
  permissions: string[];
  order: number;
  hotkey: string | null;
}

/**
 * Configuración de layout
 */
export interface LayoutConfig {
  sidebar?: {
    position: string;
    width: number;
    collapsible: boolean;
    defaultCollapsed: boolean;
  };
  header?: {
    position: string;
    height: number;
    showUserInfo: boolean;
    showNotifications: boolean;
  };
  navigation?: {
    position: string;
    type: string;
  };
  content?: {
    maxWidth: number | null;
    padding: number;
  };
  density: 'compact' | 'normal' | 'comfortable';
  panelSize?: {
    sidebar: number;
    panel: number | string;
    modal: number | string;
    drawer: number | string;
  };
}

/**
 * Configuración de personalización
 */
export interface Customization {
  theme: string | null;
  language: string | null;
  density: string | null;
  panelSize: string | null;
  favoriteWidgets: string[];
  customOrder: Record<string, number[]>;
}

/**
 * Metadata del Workspace
 */
export interface WorkspaceMetadata {
  identityStatus: string;
  shift: any;
  branchId: string | null;
  generatedAt: string;
}

/**
 * Workspace Definition completo
 */
export interface WorkspaceDefinition {
  userId: string;
  role: string;
  platform: PlatformType;
  layout: LayoutType;
  layoutConfig: LayoutConfig;
  navigation: NavigationItem[];
  widgets: Widget[];
  features: Feature[];
  shortcuts: Shortcut[];
  permissions: string[];
  theme: string;
  landingPage: string;
  customization: Customization;
  metadata: WorkspaceMetadata;
}

/**
 * Respuesta del endpoint de Workspace
 */
export interface WorkspaceResponse {
  success: boolean;
  data: WorkspaceDefinition;
  message: string | null;
}
