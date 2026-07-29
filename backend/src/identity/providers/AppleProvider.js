/* =========================================================
   APPLE PROVIDER
   Proveedor de identidad para Apple Sign In
   Preparado para futura implementación
========================================================= */

import IdentityProvider from './IdentityProvider.js';

class AppleProvider extends IdentityProvider {
  constructor(config = {}) {
    super('apple', config);
    this.clientId = config.clientId || process.env.APPLE_CLIENT_ID;
    this.teamId = config.teamId || process.env.APPLE_TEAM_ID;
    this.keyId = config.keyId || process.env.APPLE_KEY_ID;
    this.privateKey = config.privateKey || process.env.APPLE_PRIVATE_KEY;
    this.callbackUrl = config.callbackUrl || process.env.APPLE_CALLBACK_URL;
  }

  /**
   * Inicia el flujo de autenticación con Apple
   * @returns {string} URL de redirección a Apple
   */
  async authenticate() {
    // TODO: Implementar cuando se agregue passport-apple
    throw new Error('Apple Sign In no implementado aún');
  }

  /**
   * Procesa el callback de Apple
   * @param {Object} params - Parámetros del callback (code, state, id_token)
   * @returns {Promise<Object>} Datos del usuario de Apple
   */
  async callback(params) {
    // TODO: Implementar validación de JWT de Apple
    // TODO: Obtener perfil de usuario de Apple
    throw new Error('Apple Sign In callback no implementado aún');
  }

  /**
   * Normaliza los datos del usuario de Apple
   * @param {Object} appleData - Datos de Apple
   * @returns {Object} Datos normalizados
   */
  normalizeUserData(appleData) {
    return {
      provider: 'apple',
      providerId: appleData.sub,
      email: appleData.email, // Solo disponible en primer login
      name: appleData.name ? {
        firstName: appleData.name.firstName,
        lastName: appleData.name.lastName,
      } : null,
      emailVerified: appleData.email_verified,
    };
  }

  /**
   * Vincula una cuenta de Apple a un usuario existente
   * @param {string} userId - ID del usuario
   * @param {string} appleId - ID de Apple
   * @returns {Promise<Object>}
   */
  async linkAccount(userId, appleId) {
    // TODO: Implementar vinculación en modelo User
    throw new Error('Vinculación de cuenta Apple no implementada aún');
  }

  /**
   * Desvincula una cuenta de Apple
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async unlinkAccount(userId) {
    // TODO: Implementar desvinculación en modelo User
    throw new Error('Desvinculación de cuenta Apple no implementada aún');
  }
}

export default AppleProvider;
