/* =========================================================
   PROVIDER TYPES
   Tipos base para Identity Providers
   Arquitectura extensible para múltiples proveedores OAuth
========================================================= */

/**
 * Enumeración de proveedores de identidad
 */
export const IdentityProvider = {
  LOCAL: 'local',
  GOOGLE: 'google',
  APPLE: 'apple',
  GITHUB: 'github',
  MICROSOFT: 'microsoft',
  FACEBOOK: 'facebook',
};

/**
 * Información de perfil de usuario desde proveedor
 */
export class ProviderProfile {
  constructor(data) {
    this.id = data.id; // ID del usuario en el proveedor
    this.email = data.email;
    this.emailVerified = data.emailVerified || false;
    this.name = data.name;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.avatar = data.avatar;
    this.locale = data.locale;
    this.provider = data.provider;
  }
}

/**
 * Información de sesión OAuth
 */
export class OAuthSession {
  constructor(data) {
    this.state = data.state; // CSRF token
    this.provider = data.provider;
    this.redirectUri = data.redirectUri;
    this.createdAt = data.createdAt || new Date();
    this.expiresAt = data.expiresAt || new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
  }

  isExpired() {
    return this.expiresAt < new Date();
  }
}

/**
 * Resultado de autenticación OAuth
 */
export class OAuthResult {
  constructor(data) {
    this.success = data.success;
    this.user = data.user;
    this.provider = data.provider;
    this.providerId = data.providerId;
    this.isNewUser = data.isNewUser;
    this.isLinked = data.isLinked;
    this.error = data.error;
  }
}

/**
 * Configuración de proveedor OAuth
 */
export class ProviderConfig {
  constructor(data) {
    this.clientId = data.clientId;
    this.clientSecret = data.clientSecret;
    this.redirectUri = data.redirectUri;
    this.scope = data.scope;
    this.authorizationUrl = data.authorizationUrl;
    this.tokenUrl = data.tokenUrl;
    this.userInfoUrl = data.userInfoUrl;
  }
}
