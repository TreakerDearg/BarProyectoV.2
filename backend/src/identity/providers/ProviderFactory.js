/* =========================================================
   PROVIDER FACTORY
   Fábrica para crear instancias de Identity Providers
   Gestiona el registro y creación de proveedores
========================================================= */

import { IdentityProvider } from './ProviderTypes.js';
import GoogleProvider from './GoogleProvider.js';

/**
 * Registro de proveedores disponibles
 */
const providers = {
  [IdentityProvider.GOOGLE]: GoogleProvider,
  // Futuros proveedores:
  // [IdentityProvider.APPLE]: AppleProvider,
  // [IdentityProvider.GITHUB]: GitHubProvider,
  // [IdentityProvider.MICROSOFT]: MicrosoftProvider,
  // [IdentityProvider.FACEBOOK]: FacebookProvider,
};

/**
 * Fábrica de proveedores de identidad
 */
class ProviderFactory {
  /**
   * Crea una instancia de un proveedor
   * @param {string} providerName - Nombre del proveedor
   * @param {Object} config - Configuración del proveedor
   * @returns {ProviderStrategy} Instancia del proveedor
   */
  static createProvider(providerName, config = {}) {
    const ProviderClass = providers[providerName];

    if (!ProviderClass) {
      throw new Error(`Proveedor no soportado: ${providerName}`);
    }

    return new ProviderClass(config);
  }

  /**
   * Verifica si un proveedor está soportado
   * @param {string} providerName - Nombre del proveedor
   * @returns {boolean} Proveedor soportado
   */
  static isSupported(providerName) {
    return providerName in providers;
  }

  /**
   * Obtiene lista de proveedores soportados
   * @returns {string[]} Lista de nombres de proveedores
   */
  static getSupportedProviders() {
    return Object.keys(providers);
  }

  /**
   * Registra un nuevo proveedor
   * @param {string} providerName - Nombre del proveedor
   * @param {ProviderStrategy} ProviderClass - Clase del proveedor
   */
  static registerProvider(providerName, ProviderClass) {
    providers[providerName] = ProviderClass;
  }
}

export default ProviderFactory;
