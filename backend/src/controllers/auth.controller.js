import jwt    from "jsonwebtoken";
import User   from "../models/User.js";
import { logger } from "../config/logger.js";
import {
  ok, created, badRequest,
  unauthorized, forbidden, conflict, serverError, locked,
} from "../utils/response.js";
import identityService from "../identity/services/IdentityService.js";
import refreshTokenService from "../identity/services/RefreshTokenService.js";

/* =========================================================
   TOKEN GENERATOR (LEGACY - MIGRADO A IdentityService)
========================================================= */
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, shift: user.shift || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

/* =========================================================
   SAFE USER PAYLOAD (LEGACY - MIGRADO A IdentityService)
========================================================= */
const userPayload = (user) => ({
  _id:         user._id,
  name:        user.name,
  email:       user.email,
  role:        user.role,
  shift:       user.shift,
  isEmployee:  user.isEmployee,
  permissions: user.permissions || {},
  lastLogin:   user.lastLogin,
});

/* =========================================================
   REGISTER (client only)
   NOTA: En futura fase, migrar a identityService.register()
========================================================= */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return badRequest(res, "Todos los campos son obligatorios");
    }

    const exists = await User.findOne({ email });
    if (exists) return conflict(res, "El email ya está registrado");

    const user = await User.create({
      name, email, password,
      role: "client", isActive: true,
      permissions: {}, shift: null, isEmployee: false,
    });

    logger.info(`[Auth] Nuevo usuario registrado: ${email}`);

    return created(res, {
      token: generateToken(user),
      user:  userPayload(user),
    }, "Registro exitoso");

  } catch (error) {
    throw error;
  }
};

/* =========================================================
   LOGIN
   NOTA: En futura fase, migrar a identityService.authenticate()
========================================================= */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return badRequest(res, "Email y contraseña son obligatorios");
    }

    /* ─── Buscar usuario con password ─── */
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return unauthorized(res, "Credenciales inválidas");
    }

    /* ─── Verificar estado ─── */
    if (!user.isActive) {
      return forbidden(res, "Usuario desactivado");
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return locked(res, `Cuenta bloqueada. Intenta en ${minutesLeft} minuto(s)`);
    }

    /* ─── Verificar contraseña ─── */
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts?.();
      logger.warn(`[Auth] Contraseña incorrecta para: ${email}`);
      return unauthorized(res, "Credenciales inválidas");
    }

    /* ─── Reset intentos + actualizar lastLogin ─── */
    await user.resetLoginAttempts?.();
    user.lastLogin = new Date();
    await user.save();

    logger.info(`[Auth] Login exitoso: ${email} (${user.role})`);

    return ok(res, {
      token: generateToken(user),
      user:  userPayload(user),
    }, "Login exitoso");

  } catch (error) {
    throw error;
  }
};

/* =========================================================
   PROFILE (ME)
========================================================= */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "_id name email role shift isEmployee permissions lastLogin isActive"
    );

    if (!user) return unauthorized(res, "Usuario no encontrado");

    return ok(res, userPayload(user));
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   REFRESH TOKEN
   Renueva el access token usando un refresh token
========================================================= */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return badRequest(res, "Refresh token requerido");
    }

    // Verificar refresh token
    const tokenData = await refreshTokenService.verifyRefreshToken(refreshToken);

    // Buscar usuario
    const user = await User.findById(tokenData.userId).select(
      "_id name email role shift isEmployee permissions lastLogin isActive"
    );

    if (!user || !user.isActive) {
      return unauthorized(res, "Usuario no encontrado o inactivo");
    }

    // Rotar refresh token
    const newRefreshTokenData = await refreshTokenService.rotateRefreshToken(refreshToken);

    // Generar nuevo access token
    const newAccessToken = identityService.generateToken(user);

    logger.info(`[Auth] Refresh token renovado para usuario ${user.email}`);

    return ok(res, {
      token: newAccessToken,
      refreshToken: newRefreshTokenData.refreshToken,
      sessionId: newRefreshTokenData.sessionId,
      expiresAt: newRefreshTokenData.expiresAt,
    }, "Token renovado exitosamente");

  } catch (error) {
    logger.error("[Auth] Error en refreshToken:", error);
    return unauthorized(res, error.message || "Error al renovar token");
  }
};

/* =========================================================
   GET SESSIONS
   Lista todas las sesiones activas del usuario
========================================================= */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await refreshTokenService.getUserSessions(req.user.id);

    return ok(res, sessions, "Sesiones obtenidas exitosamente");
  } catch (error) {
    logger.error("[Auth] Error en getSessions:", error);
    return serverError(res, "Error al obtener sesiones");
  }
};

/* =========================================================
   REVOKE SESSION
   Revoca una sesión específica
========================================================= */
export const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { revokeAll } = req.body;

    if (revokeAll === true) {
      // Revocar todas las sesiones excepto la actual
      const currentRefreshToken = req.headers.authorization?.replace('Bearer ', '');
      const currentSession = await refreshTokenService.verifyRefreshToken(currentRefreshToken);
      const count = await refreshTokenService.revokeAllUserTokens(req.user.id, currentSession.sessionId);

      logger.info(`[Auth] Revocadas ${count} sesiones del usuario ${req.user.email} (excepto actual)`);

      return ok(res, { revokedCount: count }, "Sesiones revocadas exitosamente");
    } else {
      // Revocar sesión específica
      const session = await refreshTokenService.revokeSession(sessionId, req.user.id);

      logger.info(`[Auth] Sesión revocada: ${sessionId} por usuario ${req.user.email}`);

      return ok(res, { sessionId: session._id }, "Sesión revocada exitosamente");
    }
  } catch (error) {
    logger.error("[Auth] Error en revokeSession:", error);
    return serverError(res, error.message || "Error al revocar sesión");
  }
};

/* =========================================================
   LOGOUT
   Cierra la sesión actual revocando el refresh token
========================================================= */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revocar el refresh token específico
      await refreshTokenService.revokeRefreshToken(refreshToken);
      logger.info(`[Auth] Logout exitoso para usuario ${req.user.email}`);
    } else {
      // Si no hay refresh token, solo loggear
      logger.info(`[Auth] Logout sin refresh token para usuario ${req.user.email}`);
    }

    return ok(res, { success: true }, "Logout exitoso");
  } catch (error) {
    logger.error("[Auth] Error en logout:", error);
    // Logout nunca debe fallar, siempre retornar éxito
    return ok(res, { success: true }, "Logout exitoso");
  }
};

/* =========================================================
   GOOGLE OAUTH
   Inicia el flujo de autenticación con Google
========================================================= */
export const googleAuth = async (req, res, next) => {
  try {
    const oauthService = (await import('../identity/oauth/OAuthService.js')).default;
    const sessionInfo = {
      platform: req.headers['x-platform'] || 'web',
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };

    const response = await oauthService.initiateOAuth('google', sessionInfo);

    if (!response.success) {
      return badRequest(res, response.message);
    }

    return ok(res, {
      authorizationUrl: response.authorizationUrl,
      state: response.state,
    }, "Flujo OAuth iniciado");
  } catch (error) {
    logger.error("[Auth] Error en googleAuth:", error);
    return serverError(res, "Error al iniciar OAuth");
  }
};

/* =========================================================
   GOOGLE OAUTH CALLBACK
   Procesa el callback de Google OAuth
========================================================= */
export const googleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return badRequest(res, "Código o estado faltante");
    }

    const oauthService = (await import('../identity/oauth/OAuthService.js')).default;
    const sessionInfo = {
      platform: req.headers['x-platform'] || 'web',
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };

    const response = await oauthService.handleOAuthCallback('google', code, state, sessionInfo);

    if (!response.success) {
      return badRequest(res, response.message);
    }

    // Para Web, redirigir con tokens en URL (o usar cookie)
    // Para Desktop, redirigir con tokens en URL
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${response.token}&refreshToken=${response.refreshToken}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.error("[Auth] Error en googleCallback:", error);
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?error=oauth_error`;
    return res.redirect(errorUrl);
  }
};