/* =========================================================
   OAUTH SERVICE
   Servicio central para coordinar flujos OAuth
   Vincula Identity Providers con Bartender Identity
========================================================= */

import ProviderFactory from '../providers/ProviderFactory.js';
import { OAuthSession, OAuthResult } from '../providers/ProviderTypes.js';
import { logger } from '../../config/logger.js';
import User from '../../models/User.js';
import identityService from '../services/IdentityService.js';
import refreshTokenService from '../services/RefreshTokenService.js';
import {
  createIdentityResponse,
  createIdentityError,
  IdentityErrorCodes,
} from '../types/IdentityResponse.js';
import { createIdentityUser } from '../types/IdentityUser.js';

/**
 * Servicio OAuth
 */
class OAuthService {
  /**
   * Inicia el flujo OAuth
   * @param {string} provider - Nombre del proveedor
   * @param {Object} sessionInfo - Información de sesión
   * @returns {Promise<Object>} URL de autorización y estado
   */
  async initiateOAuth(provider, sessionInfo = {}) {
    try {
      if (!ProviderFactory.isSupported(provider)) {
        return createIdentityError(
          `Proveedor no soportado: ${provider}`,
          IdentityErrorCodes.INVALID_CREDENTIALS
        );
      }

      const providerInstance = ProviderFactory.createProvider(provider);
      const state = providerInstance.generateState();

      // Guardar sesión OAuth temporal (en producción usar Redis)
      const oauthSession = new OAuthSession({
        state,
        provider,
        redirectUri: providerInstance.config.redirectUri,
        ...sessionInfo,
      });

      logger.info(`[OAuthService] Iniciando OAuth con ${provider} para sesión ${state}`);

      const authorizationUrl = providerInstance.getAuthorizationUrl(state);

      return createIdentityResponse({
        success: true,
        authorizationUrl,
        state,
        provider,
      });
    } catch (error) {
      logger.error('[OAuthService] Error en initiateOAuth:', error);
      throw error;
    }
  }

  /**
   * Procesa el callback de OAuth
   * @param {string} provider - Nombre del proveedor
   * @param {string} code - Código de autorización
   * @param {string} state - Estado CSRF
   * @param {Object} sessionInfo - Información de sesión
   * @returns {Promise<Object>} Respuesta de identidad con tokens
   */
  async handleOAuthCallback(provider, code, state, sessionInfo = {}) {
    try {
      if (!ProviderFactory.isSupported(provider)) {
        return createIdentityError(
          `Proveedor no soportado: ${provider}`,
          IdentityErrorCodes.INVALID_CREDENTIALS
        );
      }

      const providerInstance = ProviderFactory.createProvider(provider);

      // Validar estado CSRF
      if (!providerInstance.validateState(state)) {
        logger.warn(`[OAuthService] Estado CSRF inválido: ${state}`);
        return createIdentityError(
          'Estado inválido o expirado',
          IdentityErrorCodes.INVALID_CREDENTIALS
        );
      }

      logger.info(`[OAuthService] Procesando callback OAuth con ${provider}`);

      // Intercambiar código por token
      const tokenData = await providerInstance.exchangeCodeForToken(code);

      // Obtener perfil de usuario
      const providerProfile = await providerInstance.getUserProfile(tokenData.accessToken);

      // Buscar o crear usuario
      const user = await this.findOrCreateUser(provider, providerProfile);

      // Verificar estado del usuario
      if (!user.isActive) {
        logger.warn(`[OAuthService] Usuario inactivo: ${user.email}`);
        return createIdentityError('Usuario desactivado', IdentityErrorCodes.USER_INACTIVE);
      }

      // Actualizar datos de proveedor
      await this.updateProviderData(user, provider, providerProfile);

      // Generar access token
      const token = identityService.generateToken(user);

      // Generar refresh token y crear sesión
      const refreshTokenData = await refreshTokenService.generateRefreshToken(
        user._id.toString(),
        sessionInfo
      );

      logger.info(`[OAuthService] OAuth exitoso con ${provider} para usuario ${user.email}`);

      const identityUser = createIdentityUser(user);

      return createIdentityResponse({
        success: true,
        user: identityUser,
        token,
        refreshToken: refreshTokenData.refreshToken,
        metadata: {
          session: {
            sessionId: refreshTokenData.sessionId,
            expiresAt: refreshTokenData.expiresAt,
            provider,
            ...sessionInfo,
          },
        },
      });
    } catch (error) {
      logger.error('[OAuthService] Error en handleOAuthCallback:', error);
      return createIdentityError(
        error.message || 'Error en autenticación OAuth',
        IdentityErrorCodes.INVALID_CREDENTIALS
      );
    }
  }

  /**
   * Busca o crea usuario basado en perfil de proveedor
   * @param {string} provider - Nombre del proveedor
   * @param {ProviderProfile} providerProfile - Perfil del proveedor
   * @returns {Promise<User>} Usuario
   */
  async findOrCreateUser(provider, providerProfile) {
    // Primero buscar por ID de proveedor
    let user = await User.findOne({ [`${provider}Id`]: providerProfile.id });

    if (user) {
      logger.info(`[OAuthService] Usuario encontrado por ${provider}Id: ${user.email}`);
      return user;
    }

    // Si no existe, buscar por email (vinculación automática)
    user = await User.findOne({ email: providerProfile.email });

    if (user) {
      logger.info(`[OAuthService] Vinculando cuenta existente con ${provider}: ${user.email}`);
      
      // Vincular cuenta
      user[`${provider}Id`] = providerProfile.id;
      user.provider = provider;
      user.providerVerified = true;
      await user.save();

      return user;
    }

    // Crear nuevo usuario
    logger.info(`[OAuthService] Creando nuevo usuario con ${provider}: ${providerProfile.email}`);

    user = await User.create({
      name: providerProfile.name,
      email: providerProfile.email,
      [`${provider}Id`]: providerProfile.id,
      provider,
      providerVerified: true,
      avatar: providerProfile.avatar,
      role: 'client', // Rol por defecto para nuevos usuarios
      isActive: true,
      permissions: {},
      shift: null,
      isEmployee: false,
      password: null, // Sin contraseña para usuarios OAuth
    });

    return user;
  }

  /**
   * Actualiza datos de proveedor en usuario
   * @param {User} user - Usuario
   * @param {string} provider - Nombre del proveedor
   * @param {ProviderProfile} providerProfile - Perfil del proveedor
   */
  async updateProviderData(user, provider, providerProfile) {
    user[`${provider}Id`] = providerProfile.id;
    user.provider = provider;
    user.providerVerified = providerProfile.emailVerified;
    user.avatar = providerProfile.avatar || user.avatar;
    user.lastProviderLogin = new Date();
    user.lastLogin = new Date();

    await user.save();
  }

  /**
   * Desvincula un proveedor de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} provider - Nombre del proveedor
   * @returns {Promise<Object>}
   */
  async unlinkProvider(userId, provider) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        return createIdentityError('Usuario no encontrado', IdentityErrorCodes.USER_NOT_FOUND);
      }

      // Verificar que el usuario tenga contraseña antes de desvincular
      if (!user.password && user.provider === provider) {
        return createIdentityError(
          'No puedes desvincular tu único método de autenticación',
          IdentityErrorCodes.INVALID_CREDENTIALS
        );
      }

      user[`${provider}Id`] = null;
      user.provider = user.password ? 'local' : null;
      user.providerVerified = false;

      await user.save();

      logger.info(`[OAuthService] Proveedor ${provider} desvinculado de usuario ${user.email}`);

      return createIdentityResponse({
        success: true,
        message: 'Proveedor desvinculado exitosamente',
      });
    } catch (error) {
      logger.error('[OAuthService] Error en unlinkProvider:', error);
      throw error;
    }
  }
}

export default new OAuthService();
