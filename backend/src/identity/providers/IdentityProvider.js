/* =========================================================
   IDENTITY PROVIDER BASE
   Clase base para proveedores de identidad (OAuth)
   Preparada para futura implementación de Google, GitHub, etc.
========================================================= */

class IdentityProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }

  /**
   * Inicia el flujo de autenticación
   * @returns {string} URL de redirección
   */
  async authenticate() {
    throw new Error('Method not implemented');
  }

  /**
   * Procesa el callback del proveedor
   * @param {Object} params - Parámetros del callback
   * @returns {Promise<Object>} Datos del usuario
   */
  async callback(params) {
    throw new Error('Method not implemented');
  }

  /**
   * Normaliza los datos del usuario del proveedor
   * @param {Object} providerData - Datos del proveedor
   * @returns {Object} Datos normalizados
   */
  normalizeUserData(providerData) {
    throw new Error('Method not implemented');
  }

  /**
   * Vincula una cuenta de proveedor a un usuario existente
   * @param {string} userId - ID del usuario
   * @param {string} providerId - ID del proveedor
   * @returns {Promise<Object>}
   */
  async linkAccount(userId, providerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Desvincula una cuenta de proveedor
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async unlinkAccount(userId) {
    throw new Error('Method not implemented');
  }
}

export default IdentityProvider;
