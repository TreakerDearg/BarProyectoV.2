/* =========================================================
   IDENTITY SERVICE
   Servicio central de identidad - Bartender Identity
   Responsable de toda la lógica de autenticación y autorización
========================================================= */

import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { logger } from '../../config/logger.js';
import {
  createIdentityUser,
  canUserLogin,
  getLockMessage,
} from '../types/IdentityUser.js';
import {
  createIdentityResponse,
  createIdentityError,
  IdentityErrorCodes,
} from '../types/IdentityResponse.js';
import { determineIdentityStatus } from '../types/IdentityStatus.js';
import refreshTokenService from './RefreshTokenService.js';

class IdentityService {
  /**
   * Autentica un usuario con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @param {Object} sessionInfo - Información de sesión
   * @returns {Promise<Object>} Respuesta de identidad
   */
  async authenticate(email, password, sessionInfo = {}) {
    try {
      // Buscar usuario con password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        logger.warn(`[IdentityService] Usuario no encontrado: ${email}`);
        return createIdentityError('Credenciales inválidas', IdentityErrorCodes.INVALID_CREDENTIALS);
      }

      // Verificar estado
      if (!user.isActive) {
        logger.warn(`[IdentityService] Usuario inactivo: ${email}`);
        return createIdentityError('Usuario desactivado', IdentityErrorCodes.USER_INACTIVE);
      }

      // Verificar si está bloqueado
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const lockMessage = getLockMessage(createIdentityUser(user));
        logger.warn(`[IdentityService] Usuario bloqueado: ${email}`);
        return createIdentityError(lockMessage, IdentityErrorCodes.USER_LOCKED);
      }

      // Verificar contraseña
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        await user.incrementLoginAttempts();
        logger.warn(`[IdentityService] Contraseña incorrecta: ${email}`);
        return createIdentityError('Credenciales inválidas', IdentityErrorCodes.INVALID_CREDENTIALS);
      }

      // Reset intentos + actualizar lastLogin
      await user.resetLoginAttempts();
      user.lastLogin = new Date();
      await user.save();

      // Crear usuario de identidad
      const identityUser = createIdentityUser(user);

      // Generar access token (JWT de corta duración)
      const token = await this.generateToken(user);

      // Generar refresh token y crear sesión
      const refreshTokenData = await refreshTokenService.generateRefreshToken(
        user._id.toString(),
        sessionInfo
      );

      logger.info(`[IdentityService] Login exitoso: ${email} (${user.role}) - Sesión: ${refreshTokenData.sessionId}`);

      // Crear respuesta de identidad
      return createIdentityResponse({
        success: true,
        user: identityUser,
        token: token,
        refreshToken: refreshTokenData.refreshToken,
        metadata: {
          session: {
            sessionId: refreshTokenData.sessionId,
            expiresAt: refreshTokenData.expiresAt,
            ...sessionInfo,
          },
        },
      });
    } catch (error) {
      logger.error('[IdentityService] Error en authenticate:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario (solo clientes por ahora)
   * @param {Object} userData - Datos del usuario
   * @param {Object} sessionInfo - Información de sesión
   * @returns {Promise<Object>} Respuesta de identidad
   */
  async register(userData, sessionInfo = {}) {
    try {
      const { name, email, password } = userData;

      // Verificar si ya existe
      const exists = await User.findOne({ email });
      if (exists) {
        return createIdentityError('El email ya está registrado', IdentityErrorCodes.USER_NOT_FOUND);
      }

      // Crear usuario (solo client por ahora)
      const user = await User.create({
        name,
        email,
        password,
        role: 'client',
        isActive: true,
        permissions: {},
        shift: null,
        isEmployee: false,
      });

      logger.info(`[IdentityService] Usuario registrado: ${email}`);

      // Crear usuario de identidad
      const identityUser = createIdentityUser(user);

      // Generar access token (JWT de corta duración)
      const token = await this.generateToken(user);

      // Generar refresh token y crear sesión
      const refreshTokenData = await refreshTokenService.generateRefreshToken(
        user._id.toString(),
        sessionInfo
      );

      return createIdentityResponse({
        success: true,
        user: identityUser,
        token: token,
        refreshToken: refreshTokenData.refreshToken,
        message: 'Registro exitoso',
        metadata: {
          session: {
            sessionId: refreshTokenData.sessionId,
            expiresAt: refreshTokenData.expiresAt,
            ...sessionInfo,
          },
        },
      });
    } catch (error) {
      logger.error('[IdentityService] Error en register:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil de un usuario autenticado
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Respuesta de identidad
   */
  async getProfile(userId) {
    try {
      const user = await User.findById(userId).select(
        '_id name email role shift isEmployee permissions lastLogin isActive'
      );

      if (!user) {
        return createIdentityError('Usuario no encontrado', IdentityErrorCodes.USER_NOT_FOUND);
      }

      const identityUser = createIdentityUser(user);

      return createIdentityResponse({
        success: true,
        user: identityUser,
      });
    } catch (error) {
      logger.error('[IdentityService] Error en getProfile:', error);
      throw error;
    }
  }

  /**
   * Valida un token JWT
   * @param {string} token - Token JWT
   * @returns {Promise<Object>} Usuario decodificado
   */
  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuario para verificar que existe y está activo
      const user = await User.findById(decoded.id).select(
        '_id name email role shift isEmployee permissions lastLogin isActive lockUntil'
      );

      if (!user) {
        throw new Error('Usuario no existe');
      }

      if (!user.isActive) {
        throw new Error('Usuario inactivo');
      }

      if (user.lockUntil && user.lockUntil > Date.now()) {
        throw new Error('Usuario bloqueado');
      }

      return createIdentityUser(user);
    } catch (error) {
      logger.error('[IdentityService] Error en validateToken:', error);
      throw error;
    }
  }

  /**
   * Genera un token JWT (Access Token de corta duración)
   * @param {Object} user - Usuario del modelo
   * @returns {Promise<string>} Token JWT
   */
  async generateToken(user) {
    // Access token expira en 15-30 minutos (configurable)
    const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '30m';
    return jwt.sign(
      { id: user._id, role: user.role, shift: user.shift || null },
      process.env.JWT_SECRET,
      { expiresIn: accessTokenExpiresIn }
    );
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   * @param {Object} user - Usuario
   * @param {string} permission - Permiso a verificar
   * @returns {boolean}
   */
  hasPermission(user, permission) {
    if (!user || !user.permissions) return false;
    return user.permissions[permission] === true;
  }

  /**
   * Verifica si un usuario tiene todos los permisos especificados
   * @param {Object} user - Usuario
   * @param {string[]} permissions - Permisos a verificar
   * @returns {boolean}
   */
  hasAllPermissions(user, permissions = []) {
    return permissions.every(perm => this.hasPermission(user, perm));
  }

  /**
   * Verifica si un usuario tiene al menos uno de los permisos especificados
   * @param {Object} user - Usuario
   * @param {string[]} permissions - Permisos a verificar
   * @returns {boolean}
   */
  hasAnyPermission(user, permissions = []) {
    return permissions.some(perm => this.hasPermission(user, perm));
  }
}

export default new IdentityService();
