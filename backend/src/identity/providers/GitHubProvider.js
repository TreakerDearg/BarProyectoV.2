/* =========================================================
   GITHUB PROVIDER
   Proveedor de identidad para GitHub OAuth
   Preparado para futura implementación
========================================================= */

import IdentityProvider from './IdentityProvider.js';

class GitHubProvider extends IdentityProvider {
  constructor(config = {}) {
    super('github', config);
    this.clientId = config.clientId || process.env.GITHUB_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.GITHUB_CLIENT_SECRET;
    this.callbackUrl = config.callbackUrl || process.env.GITHUB_CALLBACK_URL;
  }

  /**
   * Inicia el flujo de autenticación con GitHub
   * @returns {string} URL de redirección a GitHub
   */
  async authenticate() {
    // TODO: Implementar cuando se agregue passport-github
    throw new Error('GitHub OAuth no implementado aún');
  }

  /**
   * Procesa el callback de GitHub
   * @param {Object} params - Parámetros del callback (code, state)
   * @returns {Promise<Object>} Datos del usuario de GitHub
   */
  async callback(params) {
    // TODO: Implementar intercambio de código por token
    // TODO: Obtener perfil de usuario de GitHub
    throw new Error('GitHub OAuth callback no implementado aún');
  }

  /**
   * Normaliza los datos del usuario de GitHub
   * @param {Object} githubData - Datos de GitHub
   * @returns {Object} Datos normalizados
   */
  normalizeUserData(githubData) {
    return {
      provider: 'github',
      providerId: githubData.id?.toString(),
      email: githubData.email,
      name: githubData.name || githubData.login,
      username: githubData.login,
      avatar: githubData.avatar_url,
      bio: githubData.bio,
      location: githubData.location,
      publicRepos: githubData.public_repos,
    };
  }

  /**
   * Vincula una cuenta de GitHub a un usuario existente
   * @param {string} userId - ID del usuario
   * @param {string} githubId - ID de GitHub
   * @returns {Promise<Object>}
   */
  async linkAccount(userId, githubId) {
    // TODO: Implementar vinculación en modelo User
    throw new Error('Vinculación de cuenta GitHub no implementada aún');
  }

  /**
   * Desvincula una cuenta de GitHub
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async unlinkAccount(userId) {
    // TODO: Implementar desvinculación en modelo User
    throw new Error('Desvinculación de cuenta GitHub no implementada aún');
  }
}

export default GitHubProvider;
