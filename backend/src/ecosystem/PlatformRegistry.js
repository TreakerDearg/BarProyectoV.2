/**
 * PLATFORM REGISTRY
 * Registro centralizado de todas las plataformas del ecosistema Bartender
 */

/**
 * Tipos de plataforma disponibles
 */
export const PlatformType = Object.freeze({
  WEB_CLIENT: 'web_client',
  WEB_ADMIN: 'web_admin',
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  KIOSK: 'kiosk',
  API: 'api',
});

/**
 * Definiciones de plataformas
 */
const PLATFORM_DEFINITIONS = {
  [PlatformType.WEB_CLIENT]: {
    name: 'Web Cliente',
    description: 'Aplicación web para clientes',
    category: 'web',
    supportsSSO: true,
    supportsRealtime: true,
    maxSessions: 5,
    sessionTimeout: 30 * 60 * 1000, // 30 minutos
    refreshTimeout: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
  [PlatformType.WEB_ADMIN]: {
    name: 'Web Administrativo',
    description: 'Dashboard web para administradores',
    category: 'web',
    supportsSSO: true,
    supportsRealtime: true,
    maxSessions: 3,
    sessionTimeout: 60 * 60 * 1000, // 1 hora
    refreshTimeout: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
  [PlatformType.DESKTOP]: {
    name: 'Desktop',
    description: 'Aplicación de escritorio para empleados',
    category: 'desktop',
    supportsSSO: true,
    supportsRealtime: true,
    maxSessions: 2,
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 horas
    refreshTimeout: 30 * 24 * 60 * 60 * 1000, // 30 días
  },
  [PlatformType.MOBILE]: {
    name: 'Mobile',
    description: 'Aplicación móvil',
    category: 'mobile',
    supportsSSO: true,
    supportsRealtime: true,
    maxSessions: 3,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    refreshTimeout: 30 * 24 * 60 * 60 * 1000, // 30 días
  },
  [PlatformType.TABLET]: {
    name: 'Tablet',
    description: 'Aplicación para tablets',
    category: 'tablet',
    supportsSSO: true,
    supportsRealtime: true,
    maxSessions: 3,
    sessionTimeout: 4 * 60 * 60 * 1000, // 4 horas
    refreshTimeout: 30 * 24 * 60 * 60 * 1000, // 30 días
  },
  [PlatformType.KIOSK]: {
    name: 'Kiosco',
    description: 'Kiosco de autoservicio',
    category: 'kiosk',
    supportsSSO: false,
    supportsRealtime: true,
    maxSessions: 1,
    sessionTimeout: 15 * 60 * 1000, // 15 minutos
    refreshTimeout: 0, // No refresh tokens
  },
  [PlatformType.API]: {
    name: 'API',
    description: 'Acceso programático',
    category: 'api',
    supportsSSO: true,
    supportsRealtime: false,
    maxSessions: 10,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    refreshTimeout: 90 * 24 * 60 * 60 * 1000, // 90 días
  },
};

/**
 * Obtiene la definición de una plataforma
 * @param {string} platformType - Tipo de plataforma
 * @returns {Object} Definición de la plataforma
 */
export const getPlatformDefinition = (platformType) => {
  return PLATFORM_DEFINITIONS[platformType] || null;
};

/**
 * Verifica si una plataforma soporta SSO
 * @param {string} platformType - Tipo de plataforma
 * @returns {boolean}
 */
export const supportsSSO = (platformType) => {
  const definition = getPlatformDefinition(platformType);
  return definition ? definition.supportsSSO : false;
};

/**
 * Verifica si una plataforma soporta tiempo real
 * @param {string} platformType - Tipo de plataforma
 * @returns {boolean}
 */
export const supportsRealtime = (platformType) => {
  const definition = getPlatformDefinition(platformType);
  return definition ? definition.supportsRealtime : false;
};

/**
 * Obtiene el timeout de sesión para una plataforma
 * @param {string} platformType - Tipo de plataforma
 * @returns {number} Timeout en milisegundos
 */
export const getSessionTimeout = (platformType) => {
  const definition = getPlatformDefinition(platformType);
  return definition ? definition.sessionTimeout : 30 * 60 * 1000;
};

/**
 * Obtiene el timeout de refresh token para una plataforma
 * @param {string} platformType - Tipo de plataforma
 * @returns {number} Timeout en milisegundos
 */
export const getRefreshTimeout = (platformType) => {
  const definition = getPlatformDefinition(platformType);
  return definition ? definition.refreshTimeout : 7 * 24 * 60 * 60 * 1000;
};

/**
 * Obtiene el máximo de sesiones permitidas para una plataforma
 * @param {string} platformType - Tipo de plataforma
 * @returns {number}
 */
export const getMaxSessions = (platformType) => {
  const definition = getPlatformDefinition(platformType);
  return definition ? definition.maxSessions : 5;
};

/**
 * Registra todas las plataformas disponibles
 * @returns {Array} Lista de plataformas
 */
export const getAllPlatforms = () => {
  return Object.keys(PLATFORM_DEFINITIONS).map(platformType => ({
    type: platformType,
    ...PLATFORM_DEFINITIONS[platformType],
  }));
};

/**
 * Detecta el tipo de plataforma desde el User-Agent
 * @param {string} userAgent - User-Agent string
 * @returns {string} Tipo de plataforma detectado
 */
export const detectPlatformFromUserAgent = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  
  // Desktop
  if (ua.includes('electron') || ua.includes('desktop')) {
    return PlatformType.DESKTOP;
  }
  
  // Mobile
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return PlatformType.MOBILE;
  }
  
  // Tablet
  if (ua.includes('ipad') || ua.includes('tablet')) {
    return PlatformType.TABLET;
  }
  
  // Kiosk
  if (ua.includes('kiosk')) {
    return PlatformType.KIOSK;
  }
  
  // Default: Web Client
  return PlatformType.WEB_CLIENT;
};

/**
 * Valida si un tipo de plataforma es válido
 * @param {string} platformType - Tipo de plataforma
 * @returns {boolean}
 */
export const isValidPlatform = (platformType) => {
  return Object.values(PlatformType).includes(platformType);
};
