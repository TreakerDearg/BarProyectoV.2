/* =========================================================
   GOOGLE PROVIDER
   Implementación de Google OAuth usando ProviderStrategy
========================================================= */

import { ProviderStrategy } from './ProviderStrategy.js';
import { ProviderProfile } from './ProviderTypes.js';
import axios from 'axios';

class GoogleProvider extends ProviderStrategy {
  constructor(config = {}) {
    super({
      clientId: config.clientId || process.env.GOOGLE_CLIENT_ID,
      clientSecret: config.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: config.redirectUri || process.env.GOOGLE_REDIRECT_URI || `${process.env.API_URL}/auth/google/callback`,
      scope: config.scope || 'openid profile email',
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });
  }

  /**
   * Genera URL de autorización de Google
   * @param {string} state - CSRF token
   * @returns {string} URL de autorización
   */
  getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      response_type: 'code',
      state: state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Intercambia código de autorización por token de acceso
   * @param {string} code - Código de autorización
   * @returns {Promise<Object>} Token de acceso
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(this.config.tokenUrl, {
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        idToken: response.data.id_token,
      };
    } catch (error) {
      throw new Error(`Error al intercambiar código por token: ${error.message}`);
    }
  }

  /**
   * Obtiene perfil de usuario usando token de acceso
   * @param {string} accessToken - Token de acceso
   * @returns {Promise<ProviderProfile>} Perfil de usuario
   */
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(this.config.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const googleData = response.data;

      return new ProviderProfile({
        id: googleData.id,
        email: googleData.email,
        emailVerified: googleData.verified_email,
        name: googleData.name,
        firstName: googleData.given_name,
        lastName: googleData.family_name,
        avatar: googleData.picture,
        locale: googleData.locale,
        provider: 'google',
      });
    } catch (error) {
      throw new Error(`Error al obtener perfil de usuario: ${error.message}`);
    }
  }

  /**
   * Valida el token de acceso
   * @param {string} accessToken - Token de acceso
   * @returns {Promise<boolean>} Token válido
   */
  async validateToken(accessToken) {
    try {
      const response = await axios.get(this.config.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default GoogleProvider;
