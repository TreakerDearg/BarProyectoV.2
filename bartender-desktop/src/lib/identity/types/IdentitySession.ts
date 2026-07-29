/* =========================================================
   IDENTITY SESSION STRUCTURE
   Estructura de sesión preparada para el futuro
   Compartido entre frontend y backend
========================================================= */

/**
 * Plataformas del sistema
 */
export enum Platform {
  WEB = 'web',
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  ADMIN = 'admin',
}

/**
 * Estados de sesión
 */
export enum SessionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

/**
 * Información del dispositivo
 */
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  name: string | null;
  os: string | null;
  browser: string | null;
  userAgent: string | null;
}

/**
 * Información de ubicación
 */
export interface LocationInfo {
  ip: string | null;
  country: string | null;
  city: string | null;
}

/**
 * Timestamps de sesión
 */
export interface SessionTimestamps {
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date | null;
}

/**
 * Metadatos de sesión
 */
export interface SessionMetadata {
  isTrusted: boolean;
  isRemembered: boolean;
  loginMethod: 'password' | 'google' | 'github' | 'microsoft' | 'apple';
  mfaVerified: boolean;
}

/**
 * Estructura completa de sesión
 */
export interface IdentitySession {
  sessionId: string | null;
  userId: string | null;
  platform: Platform;
  device: DeviceInfo;
  location: LocationInfo;
  timestamps: SessionTimestamps;
  status: SessionStatus;
  metadata: SessionMetadata;
}

/**
 * Crea una estructura de sesión
 */
export const createIdentitySession = (options: Partial<IdentitySession> = {}): IdentitySession => {
  return {
    sessionId: options.sessionId || null,
    userId: options.userId || null,
    platform: options.platform || Platform.DESKTOP,
    device: options.device || {
      type: 'desktop',
      name: null,
      os: null,
      browser: null,
      userAgent: null,
    },
    location: options.location || {
      ip: null,
      country: null,
      city: null,
    },
    timestamps: options.timestamps || {
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: null,
    },
    status: options.status || SessionStatus.ACTIVE,
    metadata: options.metadata || {
      isTrusted: false,
      isRemembered: false,
      loginMethod: 'password',
      mfaVerified: false,
    },
  };
};

/**
 * Verifica si una sesión está activa
 */
export const isSessionActive = (session: IdentitySession): boolean => {
  if (!session) return false;
  if (session.status !== SessionStatus.ACTIVE) return false;
  if (session.timestamps.expiresAt && new Date() > new Date(session.timestamps.expiresAt)) {
    return false;
  }
  return true;
};

/**
 * Verifica si una sesión ha expirado
 */
export const isSessionExpired = (session: IdentitySession): boolean => {
  if (!session || !session.timestamps.expiresAt) return false;
  return new Date() > new Date(session.timestamps.expiresAt);
};
