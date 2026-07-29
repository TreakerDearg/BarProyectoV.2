/* =========================================================
   REFRESH TOKEN SERVICE
   Servicio completo para gestión de refresh tokens con rotación
========================================================= */

import crypto from 'crypto';
import Session from '../../models/Session.js';
import { logger } from '../../config/logger.js';
import { parseUserAgent } from '../types/IdentitySession.js';

class RefreshTokenService {
  /**
   * Genera un refresh token y crea una sesión
   * @param {string} userId - ID del usuario
   * @param {Object} sessionInfo - Información de sesión
   * @returns {Promise<Object>} { refreshToken, sessionId }
   */
  async generateRefreshToken(userId, sessionInfo = {}) {
    try {
      // Generar token único
      const refreshToken = crypto.randomBytes(64).toString('hex');

      // Calcular expiración (7-30 días configurable)
      const expiresInDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '7');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Parsear user agent si está disponible
      const deviceInfo = sessionInfo.userAgent
        ? parseUserAgent(sessionInfo.userAgent)
        : {
            type: 'unknown',
            name: null,
            os: null,
            browser: null,
            userAgent: sessionInfo.userAgent || null,
          };

      // Crear sesión
      const session = await Session.create({
        userId,
        refreshToken,
        platform: sessionInfo.platform || 'web',
        device: deviceInfo,
        location: {
          ip: sessionInfo.ip || null,
          country: null,
          city: null,
        },
        expiresAt,
        metadata: {
          isTrusted: sessionInfo.isTrusted || false,
          isRemembered: sessionInfo.isRemembered || false,
          loginMethod: sessionInfo.loginMethod || 'password',
          mfaVerified: sessionInfo.mfaVerified || false,
        },
      });

      logger.info(`[RefreshTokenService] Sesión creada: ${session._id} para usuario ${userId}`);

      return {
        refreshToken,
        sessionId: session._id.toString(),
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      logger.error('[RefreshTokenService] Error en generateRefreshToken:', error);
      throw error;
    }
  }

  /**
   * Verifica un refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Datos del token
   */
  async verifyRefreshToken(refreshToken) {
    try {
      const session = await Session.findOne({ refreshToken, status: 'active' });

      if (!session) {
        logger.warn('[RefreshTokenService] Refresh token no encontrado o revocado');
        throw new Error('Refresh token inválido');
      }

      if (session.expiresAt < new Date()) {
        logger.warn('[RefreshTokenService] Refresh token expirado');
        await session.revoke();
        throw new Error('Refresh token expirado');
      }

      // Actualizar última actividad
      await session.updateActivity();

      return {
        userId: session.userId.toString(),
        sessionId: session._id.toString(),
        platform: session.platform,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      logger.error('[RefreshTokenService] Error en verifyRefreshToken:', error);
      throw error;
    }
  }

  /**
   * Rota un refresh token (genera uno nuevo y revoca el anterior)
   * @param {string} oldRefreshToken - Refresh token anterior
   * @returns {Promise<Object>} Nuevo refresh token
   */
  async rotateRefreshToken(oldRefreshToken) {
    try {
      // Verificar token anterior
      const oldSession = await Session.findOne({ refreshToken: oldRefreshToken, status: 'active' });

      if (!oldSession) {
        logger.warn('[RefreshTokenService] Refresh token a rotar no encontrado o ya revocado');
        throw new Error('Refresh token inválido');
      }

      if (oldSession.expiresAt < new Date()) {
        logger.warn('[RefreshTokenService] Refresh token a rotar expirado');
        await oldSession.revoke();
        throw new Error('Refresh token expirado');
      }

      // Revocar token anterior
      await oldSession.revoke();

      // Generar nuevo token
      const newTokenData = await this.generateRefreshToken(
        oldSession.userId.toString(),
        {
          platform: oldSession.platform,
          userAgent: oldSession.device?.userAgent,
          ip: oldSession.location?.ip,
          isTrusted: oldSession.metadata?.isTrusted,
          isRemembered: oldSession.metadata?.isRemembered,
          loginMethod: oldSession.metadata?.loginMethod,
          mfaVerified: oldSession.metadata?.mfaVerified,
        }
      );

      logger.info(`[RefreshTokenService] Refresh token rotado: ${oldSession._id} -> ${newTokenData.sessionId}`);

      return newTokenData;
    } catch (error) {
      logger.error('[RefreshTokenService] Error en rotateRefreshToken:', error);
      throw error;
    }
  }

  /**
   * Revoca un refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Sesión revocada
   */
  async revokeRefreshToken(refreshToken) {
    try {
      const session = await Session.revokeByRefreshToken(refreshToken);

      if (!session) {
        logger.warn('[RefreshTokenService] Refresh token a revocar no encontrado');
        throw new Error('Refresh token no encontrado');
      }

      logger.info(`[RefreshTokenService] Sesión revocada: ${session._id}`);

      return session;
    } catch (error) {
      logger.error('[RefreshTokenService] Error en revokeRefreshToken:', error);
      throw error;
    }
  }

  /**
   * Revoca todos los refresh tokens de un usuario (logout global)
   * @param {string} userId - ID del usuario
   * @param {string} exceptSessionId - ID de sesión a mantener (opcional)
   * @returns {Promise<number>} Cantidad de sesiones revocadas
   */
  async revokeAllUserTokens(userId, exceptSessionId = null) {
    try {
      const count = await Session.revokeAllUserSessions(userId, exceptSessionId);

      logger.info(`[RefreshTokenService] Revocadas ${count} sesiones del usuario ${userId}`);

      return count;
    } catch (error) {
      logger.error('[RefreshTokenService] Error en revokeAllUserTokens:', error);
      throw error;
    }
  }

  /**
   * Limpia tokens expirados
   * @returns {Promise<number>} Cantidad de tokens eliminados
   */
  async cleanupExpiredTokens() {
    try {
      const count = await Session.cleanupExpired();

      if (count > 0) {
        logger.info(`[RefreshTokenService] Limpieza de sesiones expiradas: ${count} eliminadas`);
      }

      return count;
    } catch (error) {
      logger.error('[RefreshTokenService] Error en cleanupExpiredTokens:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las sesiones activas de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Sesiones activas
   */
  async getUserSessions(userId) {
    try {
      const sessions = await Session.getActiveSessions(userId);
      return sessions.map(session => ({
        id: session._id.toString(),
        platform: session.platform,
        device: session.device,
        location: session.location,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        metadata: session.metadata,
      }));
    } catch (error) {
      logger.error('[RefreshTokenService] Error en getUserSessions:', error);
      throw error;
    }
  }

  /**
   * Revoca una sesión específica por ID
   * @param {string} sessionId - ID de la sesión
   * @param {string} userId - ID del usuario (para verificación)
   * @returns {Promise<Object>} Sesión revocada
   */
  async revokeSession(sessionId, userId) {
    try {
      const session = await Session.findOne({ _id: sessionId, userId, status: 'active' });

      if (!session) {
        logger.warn('[RefreshTokenService] Sesión a revocar no encontrada');
        throw new Error('Sesión no encontrada');
      }

      await session.revoke();

      logger.info(`[RefreshTokenService] Sesión revocada por ID: ${sessionId}`);

      return session;
    } catch (error) {
      logger.error('[RefreshTokenService] Error en revokeSession:', error);
      throw error;
    }
  }
}

export default new RefreshTokenService();
