/* =========================================================
   PROVIDER STRATEGY
   Estrategia base para Identity Providers
   Cada proveedor implementa sus métodos específicos
========================================================= */

import { ProviderConfig, ProviderProfile } from './ProviderTypes.js';

/**
 * Estrategia base para proveedores OAuth
 */
export class ProviderStrategy {
  constructor(config) {
    this.config = new ProviderConfig(config);
    this.providerName = this.constructor.name.replace('Provider', '').toLowerCase();
  }

  /**
   * Genera URL de autorización
   * @param {string} state - CSRF token
   * @returns {string} URL de autorización
   */
  getAuthorizationUrl(state) {
    throw new Error('getAuthorizationUrl debe ser implementado por el proveedor');
  }

  /**
   * Intercambia código de autorización por token de acceso
   * @param {string} code - Código de autorización
   * @returns {Promise<Object>} Token de acceso
   */
  async exchangeCodeForToken(code) {
    throw new Error('exchangeCodeForToken debe ser implementado por el proveedor');
  }

  /**
   * Obtiene perfil de usuario usando token de acceso
   * @param {string} accessToken - Token de acceso
   * @returns {Promise<ProviderProfile>} Perfil de usuario
   */
  async getUserProfile(accessToken) {
    throw new Error('getUserProfile debe ser implementado por el proveedor');
  }

  /**
   * Valida el token de acceso
   * @param {string} accessToken - Token de acceso
   * @returns {Promise<boolean>} Token válido
   */
  async validateToken(accessToken) {
    throw new Error('validateToken debe ser implementado por el proveedor');
  }

  /**
   * Genera estado CSRF para OAuth
   * @returns {string} Estado CSRF
   */
  generateState(extra = {}) {
    return Buffer.from(
      JSON.stringify({
        timestamp: Date.now(),
        provider: this.providerName,
        random: Math.random().toString(36).substring(2),
        platform: extra.platform === 'desktop' ? 'desktop' : 'web',
        audience: extra.audience || (extra.platform === 'desktop' ? 'staff' : 'client'),
      })
    ).toString('base64');
  }

  /**
   * Decodifica el estado OAuth (CSRF + origen del flujo)
   * @param {string} state - Estado CSRF
   * @returns {Object|null}
   */
  parseState(state) {
    try {
      const raw = typeof state === 'string' ? decodeURIComponent(state) : state;
      const decoded = JSON.parse(Buffer.from(raw, 'base64').toString());
      const age = Date.now() - decoded.timestamp;
      if (age >= 10 * 60 * 1000) return null;
      return {
        timestamp: decoded.timestamp,
        provider: decoded.provider,
        platform: decoded.platform === 'desktop' ? 'desktop' : 'web',
        audience: decoded.audience === 'staff' ? 'staff' : 'client',
      };
    } catch {
      return null;
    }
  }

  /**
   * Valida estado CSRF
   * @param {string} state - Estado CSRF
   * @returns {boolean} Estado válido
   */
  validateState(state) {
    return this.parseState(state) !== null;
  }
}
