/* =========================================================
   IDENTITY SESSION STRUCTURE
   Estructura de sesión preparada para el futuro
========================================================= */

/**
 * Plataformas del sistema
 */
export const Platform = Object.freeze({
  WEB: 'web',
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  ADMIN: 'admin',
});

/**
 * Estados de sesión
 */
export const SessionStatus = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
});

/**
 * Crea una estructura de sesión
 * @param {Object} options - Opciones de sesión
 * @returns {Object} Estructura de sesión
 */
export const createIdentitySession = (options = {}) => {
  return {
    // Identificación
    sessionId: options.sessionId || null,
    userId: options.userId || null,

    // Plataforma y dispositivo
    platform: options.platform || Platform.WEB,
    device: {
      type: options.device?.type || 'unknown', // desktop, mobile, tablet
      name: options.device?.name || null,
      os: options.device?.os || null,
      browser: options.device?.browser || null,
      userAgent: options.device?.userAgent || null,
    },

    // Ubicación
    location: {
      ip: options.location?.ip || null,
      country: options.location?.country || null,
      city: options.location?.city || null,
    },

    // Tiempos
    timestamps: {
      createdAt: options.timestamps?.createdAt || new Date(),
      lastActivity: options.timestamps?.lastActivity || new Date(),
      expiresAt: options.timestamps?.expiresAt || null,
    },

    // Estado
    status: options.status || SessionStatus.ACTIVE,

    // Metadatos
    metadata: {
      isTrusted: options.metadata?.isTrusted || false,
      isRemembered: options.metadata?.isRemembered || false,
      loginMethod: options.metadata?.loginMethod || 'password', // password, google, etc.
      mfaVerified: options.metadata?.mfaVerified || false,
    },
  };
};

/**
 * Verifica si una sesión está activa
 * @param {Object} session - Sesión
 * @returns {boolean}
 */
export const isSessionActive = (session) => {
  if (!session) return false;
  if (session.status !== SessionStatus.ACTIVE) return false;
  if (session.timestamps.expiresAt && new Date() > new Date(session.timestamps.expiresAt)) {
    return false;
  }
  return true;
};

/**
 * Verifica si una sesión ha expirado
 * @param {Object} session - Sesión
 * @returns {boolean}
 */
export const isSessionExpired = (session) => {
  if (!session || !session.timestamps.expiresAt) return false;
  return new Date() > new Date(session.timestamps.expiresAt);
};

/**
 * Actualiza la última actividad de una sesión
 * @param {Object} session - Sesión
 * @returns {Object} Sesión actualizada
 */
export const updateSessionActivity = (session) => {
  if (!session) return null;
  return {
    ...session,
    timestamps: {
      ...session.timestamps,
      lastActivity: new Date(),
    },
  };
};

/**
 * Revoca una sesión
 * @param {Object} session - Sesión
 * @returns {Object} Sesión revocada
 */
export const revokeSession = (session) => {
  if (!session) return null;
  return {
    ...session,
    status: SessionStatus.REVOKED,
  };
};

/**
 * Extrae información del dispositivo desde user agent
 * @param {string} userAgent - User agent string
 * @returns {Object} Información del dispositivo
 */
export const parseUserAgent = (userAgent = '') => {
  const device = {
    type: 'unknown',
    os: null,
    browser: null,
    userAgent,
  };

  // Detectar tipo de dispositivo
  if (/mobile/i.test(userAgent)) {
    device.type = 'mobile';
  } else if (/tablet/i.test(userAgent)) {
    device.type = 'tablet';
  } else if (/desktop/i.test(userAgent) || !/mobile|tablet/i.test(userAgent)) {
    device.type = 'desktop';
  }

  // Detectar OS
  if (/windows/i.test(userAgent)) device.os = 'Windows';
  else if (/mac os/i.test(userAgent)) device.os = 'macOS';
  else if (/linux/i.test(userAgent)) device.os = 'Linux';
  else if (/android/i.test(userAgent)) device.os = 'Android';
  else if (/ios/i.test(userAgent)) device.os = 'iOS';

  // Detectar navegador
  if (/chrome/i.test(userAgent)) device.browser = 'Chrome';
  else if (/firefox/i.test(userAgent)) device.browser = 'Firefox';
  else if (/safari/i.test(userAgent)) device.browser = 'Safari';
  else if (/edge/i.test(userAgent)) device.browser = 'Edge';

  return device;
};
