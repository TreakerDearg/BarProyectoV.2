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
  generateState() {
    return Buffer.from(
      JSON.stringify({
        timestamp: Date.now(),
        provider: this.providerName,
        random: Math.random().toString(36).substring(2),
      })
    ).toString('base64');
  }

  /**
   * Valida estado CSRF
   * @param {string} state - Estado CSRF
   * @returns {boolean} Estado válido
   */
  validateState(state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
      const age = Date.now() - decoded.timestamp;
      return age < 10 * 60 * 1000; // 10 minutos
    } catch {
      return false;
    }
  }
}
