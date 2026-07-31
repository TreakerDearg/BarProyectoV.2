/**
 * LAYOUT RESOLVER
 * Determina el layout basado en plataforma y rol
 */

import { LayoutType, PlatformType } from '../types/WorkspaceDefinition.js';

/**
 * Definiciones de layout por plataforma y rol
 */
const LAYOUT_DEFINITIONS = {
  web: {
    client: LayoutType.TOPBAR,
    bartender: LayoutType.SIDEBAR,
    waiter: LayoutType.SIDEBAR,
    cashier: LayoutType.SIDEBAR,
    kitchen: LayoutType.SIDEBAR,
    admin: LayoutType.SIDEBAR,
    owner: LayoutType.SIDEBAR,
  },
  desktop: {
    client: LayoutType.TOPBAR,
    bartender: LayoutType.SIDEBAR,
    waiter: LayoutType.SIDEBAR,
    cashier: LayoutType.SIDEBAR,
    kitchen: LayoutType.SIDEBAR,
    admin: LayoutType.SIDEBAR,
    owner: LayoutType.SIDEBAR,
  },
  mobile: {
    client: LayoutType.MOBILE,
    bartender: LayoutType.MOBILE,
    waiter: LayoutType.MOBILE,
    cashier: LayoutType.MOBILE,
    kitchen: LayoutType.MOBILE,
    admin: LayoutType.MOBILE,
    owner: LayoutType.MOBILE,
  },
  tablet: {
    client: LayoutType.TOPBAR,
    bartender: LayoutType.SIDEBAR,
    waiter: LayoutType.SIDEBAR,
    cashier: LayoutType.SIDEBAR,
    kitchen: LayoutType.SIDEBAR,
    admin: LayoutType.SIDEBAR,
    owner: LayoutType.SIDEBAR,
  },
};

/**
 * Configuraciones de layout por tipo
 */
const LAYOUT_CONFIGS = {
  [LayoutType.SIDEBAR]: {
    sidebar: {
      position: 'left',
      width: 260,
      collapsible: true,
      defaultCollapsed: false,
    },
    header: {
      position: 'top',
      height: 64,
      showUserInfo: true,
      showNotifications: true,
    },
    content: {
      maxWidth: null,
      padding: 24,
    },
    density: 'normal',
  },
  [LayoutType.TOPBAR]: {
    header: {
      position: 'top',
      height: 72,
      showUserInfo: true,
      showNotifications: true,
    },
    content: {
      maxWidth: 1200,
      padding: 24,
    },
    density: 'comfortable',
  },
  [LayoutType.MOBILE]: {
    header: {
      position: 'top',
      height: 56,
      showUserInfo: true,
      showNotifications: true,
    },
    navigation: {
      position: 'bottom',
      type: 'tab-bar',
    },
    content: {
      maxWidth: null,
      padding: 16,
    },
    density: 'compact',
  },
  [LayoutType.MINIMAL]: {
    header: {
      position: 'top',
      height: 48,
      showUserInfo: false,
      showNotifications: false,
    },
    content: {
      maxWidth: null,
      padding: 16,
    },
    density: 'compact',
  },
  [LayoutType.FULLSCREEN]: {
    header: {
      position: 'none',
    },
    content: {
      maxWidth: null,
      padding: 0,
    },
    density: 'normal',
  },
};

/**
 * Resuelve el layout basado en plataforma y rol
 * @param {string} platform - Plataforma (web, desktop, mobile, tablet)
 * @param {string} role - Rol del usuario
 * @returns {Object} Configuración del layout
 */
export const resolveLayout = (platform = PlatformType.WEB, role = 'client') => {
  const platformLayouts = LAYOUT_DEFINITIONS[platform] || LAYOUT_DEFINITIONS.web;
  const layoutType = platformLayouts[role] || LayoutType.TOPBAR;
  const layoutConfig = LAYOUT_CONFIGS[layoutType] || LAYOUT_CONFIGS[LayoutType.SIDEBAR];
  
  return {
    type: layoutType,
    config: layoutConfig,
  };
};

/**
 * Resuelve la densidad visual basada en plataforma
 * @param {string} platform - Plataforma
 * @returns {string} Densidad (compact, normal, comfortable)
 */
export const resolveDensity = (platform = PlatformType.WEB) => {
  const densityMap = {
    [PlatformType.MOBILE]: 'compact',
    [PlatformType.TABLET]: 'normal',
    [PlatformType.WEB]: 'comfortable',
    [PlatformType.DESKTOP]: 'normal',
  };
  
  return densityMap[platform] || 'normal';
};

/**
 * Resuelve el tamaño de panel basado en plataforma y rol
 * @param {string} platform - Plataforma
 * @param {string} role - Rol del usuario
 * @returns {Object} Configuración de tamaño de paneles
 */
export const resolvePanelSize = (platform = PlatformType.WEB, role = 'client') => {
  const adminRoles = ['admin', 'owner'];
  const isAdmin = adminRoles.includes(role);
  
  if (platform === PlatformType.DESKTOP && isAdmin) {
    return {
      sidebar: 280,
      panel: 400,
      modal: 600,
      drawer: 400,
    };
  }
  
  if (platform === PlatformType.DESKTOP) {
    return {
      sidebar: 260,
      panel: 360,
      modal: 500,
      drawer: 320,
    };
  }
  
  if (platform === PlatformType.MOBILE) {
    return {
      sidebar: 280,
      panel: '100%',
      modal: '100%',
      drawer: '100%',
    };
  }
  
  // Default (Web, Tablet)
  return {
    sidebar: 260,
    panel: 400,
    modal: 500,
    drawer: 320,
  };
};
