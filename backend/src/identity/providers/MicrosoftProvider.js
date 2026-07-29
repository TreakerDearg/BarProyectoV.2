/* =========================================================
   MICROSOFT PROVIDER
   Proveedor de identidad para Microsoft OAuth
   Preparado para futura implementación
========================================================= */

import IdentityProvider from './IdentityProvider.js';

class MicrosoftProvider extends IdentityProvider {
  constructor(config = {}) {
    super('microsoft', config);
    this.clientId = config.clientId || process.env.MICROSOFT_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.MICROSOFT_CLIENT_SECRET;
    this.callbackUrl = config.callbackUrl || process.env.MICROSOFT_CALLBACK_URL;
    this.tenant = config.tenant || 'common'; // common, organizations, consumers
  }

  /**
   * Inicia el flujo de autenticación con Microsoft
   * @returns {string} URL de redirección a Microsoft
   */
  async authenticate() {
    // TODO: Implementar cuando se agregue passport-azure-ad
    throw new Error('Microsoft OAuth no implementado aún');
  }

  /**
   * Procesa el callback de Microsoft
   * @param {Object} params - Parámetros del callback (code, state)
   * @returns {Promise<Object>} Datos del usuario de Microsoft
   */
  async callback(params) {
    // TODO: Implementar intercambio de código por token
    // TODO: Obtener perfil de usuario de Microsoft Graph
    throw new Error('Microsoft OAuth callback no implementado aún');
  }

  /**
   * Normaliza los datos del usuario de Microsoft
   * @param {Object} microsoftData - Datos de Microsoft
   * @returns {Object} Datos normalizados
   */
  normalizeUserData(microsoftData) {
    return {
      provider: 'microsoft',
      providerId: microsoftData.id,
      email: microsoftData.mail || microsoftData.userPrincipalName,
      name: microsoftData.displayName,
      givenName: microsoftData.givenName,
      familyName: microsoftData.surname,
      jobTitle: microsoftData.jobTitle,
      officeLocation: microsoftData.officeLocation,
    };
  }

  /**
   * Vincula una cuenta de Microsoft a un usuario existente
   * @param {string} userId - ID del usuario
   * @param {string} microsoftId - ID de Microsoft
   * @returns {Promise<Object>}
   */
  async linkAccount(userId, microsoftId) {
    // TODO: Implementar vinculación en modelo User
    throw new Error('Vinculación de cuenta Microsoft no implementada aún');
  }

  /**
   * Desvincula una cuenta de Microsoft
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async unlinkAccount(userId) {
    // TODO: Implementar desvinculación en modelo User
    throw new Error('Desvinculación de cuenta Microsoft no implementada aún');
  }
}

export default MicrosoftProvider;
