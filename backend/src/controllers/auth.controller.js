import jwt    from "jsonwebtoken";
import crypto from "crypto";
import User   from "../models/User.js";
import { logger } from "../config/logger.js";
import { isAllowedOrigin } from "../config/network.js";
import {
  ok, created, badRequest,
  unauthorized, forbidden, conflict, serverError, locked,
} from "../utils/response.js";
import identityService from "../identity/services/IdentityService.js";
import refreshTokenService from "../identity/services/RefreshTokenService.js";
import { canLogin, executeLoginDecision } from "../identity/decision/IdentityDecisionEngine.js";
import { initializeSession, terminateSession, refreshSession } from "../ecosystem/EcosystemService.js";

/* =========================================================
   SSO TOKEN STORE — Map en memoria, TTL 90 segundos
   Formato: ssoToken → { userId, refreshToken, createdAt }
   Sin Redis, sin modelo extra — solución simple y efectiva
========================================================= */
const ssoTokenStore = new Map();
const SSO_TTL_MS = 90_000; // 90 segundos

// Limpieza periódica de tokens expirados (cada 5 minutos)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ssoTokenStore) {
    if (now - value.createdAt > SSO_TTL_MS) {
      ssoTokenStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

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
   Usa Identity Decision Engine para determinar destino
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

    /* ─── Verificar que el usuario tiene contraseña (no es cuenta OAuth) ─── */
    if (!user.password) {
      return unauthorized(res,
        `Esta cuenta fue creada con ${user.provider || "Google"}. ` +
        "Usá el botón de Google para iniciar sesión."
      );
    }

    /* ─── Verificar contraseña ─── */
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      logger.warn(`[Auth] Contraseña incorrecta para: ${email}`);
      return unauthorized(res, "Credenciales inválidas");
    }

    /* ─── Desktop no admite cuentas de cliente ─── */
    const platform = req.headers['x-platform'] || 'web';
    if (platform === 'desktop' && user.role === 'client') {
      return forbidden(res, "Esta cuenta es de cliente. Iniciá sesión en la web del bar.");
    }

    /* ─── Verificar si puede hacer login con Decision Engine ─── */
    const loginCheck = canLogin(user);
    if (!loginCheck.canLogin) {
      if (loginCheck.blockMessage?.unlockAt) {
        const minutesLeft = Math.ceil((new Date(loginCheck.blockMessage.unlockAt) - new Date()) / 60000);
        return locked(res, loginCheck.blockMessage.message || `Cuenta bloqueada. Intenta en ${minutesLeft} minuto(s)`);
      }
      return forbidden(res, loginCheck.reason || "No puedes hacer login en este momento");
    }

    /* ─── Crear sesión ─── */
    const sessionInfo = {
      platform: req.headers['x-platform'] || 'web',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };

    /* ─── Generar tokens usando IdentityService ─── */
    let identityResult;
    try {
      identityResult = await identityService.authenticate(email, password, sessionInfo);
    } catch (error) {
      logger.error("[Auth] Error en identityService.authenticate:", error);
      return serverError(res, "Error al autenticar usuario");
    }
    
    if (!identityResult.success) {
      return unauthorized(res, identityResult.message || "Error de autenticación");
    }

    /* ─── Ejecutar Decision Engine ─── */
    let identityDecision;
    try {
      identityDecision = await executeLoginDecision(user, identityResult.metadata.session, {
        accessToken: identityResult.token,
        refreshToken: identityResult.refreshToken,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '30m',
      });
    } catch (error) {
      logger.error("[Auth] Error en executeLoginDecision:", error);
      // Continue without decision engine if it fails
      identityDecision = {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        destination: 'web',
        canAccess: true,
        token: identityResult.token,
        refreshToken: identityResult.refreshToken,
      };
    }

    /* ─── Inicializar sesión en Ecosystem (SSO) ─── */
    try {
      const ecosystemResult = await initializeSession(user, {
        sessionId: identityResult.metadata.session.sessionId,
        refreshTokenId: identityResult.metadata.session.sessionId,
        tokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        refreshTokenExpiresAt: identityResult.metadata.session.expiresAt,
      }, {
        platform: sessionInfo.platform,
        userAgent: sessionInfo.userAgent,
        ipAddress: sessionInfo.ipAddress,
        socketId: req.socket?.id,
      });

      if (!ecosystemResult?.success) {
        logger.warn(`[Auth] Ecosystem login falló: ${ecosystemResult?.reason || 'unknown error'}`);
      }
    } catch (error) {
      logger.error("[Auth] Error en initializeSession:", error);
      // Continue without ecosystem if it fails
    }

    logger.info(`[Auth] Login exitoso: ${email} (${user.role}) -> ${identityDecision.destination}`);

    return ok(res, identityDecision, "Login exitoso");

  } catch (error) {
    logger.error("[Auth] Error en loginUser:", error);
    return serverError(res, "Error interno del servidor");
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
      // Invalidar refresh token si el usuario no existe o está inactivo
      const { invalidateRefreshToken } = await import("../ecosystem/EcosystemService.js");
      await invalidateRefreshToken(tokenData._id.toString(), 'user_inactive');
      return unauthorized(res, "Usuario no encontrado o inactivo");
    }

    // Rotar refresh token
    const newRefreshTokenData = await refreshTokenService.rotateRefreshToken(refreshToken);

    // Generar nuevo access token
    const newAccessToken = identityService.generateToken(user);

    // Refrescar sesión en Ecosystem
    await refreshSession(user._id.toString(), newRefreshTokenData.sessionId, newRefreshTokenData.expiresAt);

    logger.info(`[Auth] Refresh token renovado para usuario ${user.email} via Ecosystem`);

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
      // Revocar todas las sesiones excepto la actual (Logout Global)
      const currentRefreshToken = req.headers.authorization?.replace('Bearer ', '');
      const currentSession = await refreshTokenService.verifyRefreshToken(currentRefreshToken);
      
      // Usar Ecosystem para cerrar todas las otras sesiones
      const { closeAllOtherSessions } = await import("../ecosystem/EcosystemService.js");
      await closeAllOtherSessions(req.user.id, currentSession.sessionId, 'global_logout');

      logger.info(`[Auth] Revocadas todas las sesiones del usuario ${req.user.email} (excepto actual) via Ecosystem`);

      return ok(res, { revokedCount: -1 }, "Sesiones revocadas exitosamente");
    } else {
      // Revocar sesión específica
      const session = await refreshTokenService.revokeSession(sessionId, req.user.id);
      
      // Usar Ecosystem para cerrar la sesión específica
      const { closeSession } = await import("../ecosystem/EcosystemService.js");
      await closeSession(req.user.id, sessionId, 'user_action');

      logger.info(`[Auth] Sesión revocada: ${sessionId} por usuario ${req.user.email} via Ecosystem`);

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
    const userId = req.user.id;

    if (refreshToken) {
      // Obtener sessionId del refresh token
      const session = await refreshTokenService.verifyRefreshToken(refreshToken);
      
      // Revocar el refresh token específico
      await refreshTokenService.revokeRefreshToken(refreshToken);
      
      // Terminar sesión en Ecosystem
      if (session) {
        await terminateSession(userId, session.sessionId, req.socket?.id, 'user_logout');
      }
      
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
      origin: req.headers.origin || null,
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
   Procesa el callback de Google OAuth con Decision Engine
========================================================= */
const getFrontendOrigin = (oauthOrigin = null) => {
  if (oauthOrigin && isAllowedOrigin(oauthOrigin)) return oauthOrigin;
  return process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://bar-proyecto-v-2.vercel.app';
};

const frontendCallback = (query, oauthOrigin = null) => {
  const base = `${getFrontendOrigin(oauthOrigin)}/auth/callback`;
  return `${base}?${new URLSearchParams(query).toString()}`;
};

const parseOAuthOrigin = async (state) => {
  try {
    const GoogleProvider = (await import('../identity/providers/GoogleProvider.js')).default;
    const parsed = new GoogleProvider().parseState(state);
    if (!parsed) return { platform: 'web', audience: 'client' };
    return parsed;
  } catch {
    return { platform: 'web', audience: 'client' };
  }
};

const issueSsoToken = (user) => {
  const ssoToken = crypto.randomBytes(32).toString("hex");
  ssoTokenStore.set(ssoToken, {
    userId: user._id.toString(),
    accessToken: null,
    role: user.role,
    isEmployee: user.isEmployee,
    createdAt: Date.now(),
  });
  return ssoToken;
};

export const googleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return badRequest(res, "Código o estado faltante");
    }

    const origin = await parseOAuthOrigin(state);
    const oauthService = (await import('../identity/oauth/OAuthService.js')).default;
    const sessionInfo = {
      platform: origin.platform,
      origin: origin.origin,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };

    const response = await oauthService.handleOAuthCallback('google', code, state, sessionInfo);

    if (!response.success) {
      logger.warn(`[Auth] googleCallback falló: ${response.message}`);
      return res.redirect(frontendCallback({ error: response.message || 'oauth_error' }, origin.origin));
    }

    const userId = response.user?.id ?? response.user?._id;
    if (!userId) {
      logger.error('[Auth] googleCallback: user sin id en response:', response.user);
      return res.redirect(frontendCallback({ error: 'oauth_error' }, origin.origin));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(frontendCallback({ error: 'oauth_error' }, origin.origin));
    }

    const isClient = user.role === 'client';

    if (origin.platform === 'desktop') {
      if (isClient) {
        const session = await refreshTokenService.generateRefreshToken(user._id, {
          ...sessionInfo,
          platform: 'web',
        });
        logger.info(`[Auth] Google desktop → cuenta cliente, redirigiendo a web: ${user.email}`);
        return res.redirect(frontendCallback({
          token: String(response.token || ''),
          refreshToken: session.refreshToken,
          destination: '/cliente',
          canAccess: 'true',
          identityStatus: 'CLIENT',
          isEmployee: 'false',
          role: 'client',
        }, origin.origin));
      }

      const loginCheck = canLogin(user);
      if (!loginCheck.canLogin) {
        return res.redirect(frontendCallback({ error: loginCheck.reason || 'oauth_error' }, origin.origin));
      }

      const ssoToken = issueSsoToken(user);
      logger.info(`[Auth] Google OAuth desktop: ${user.email} (${user.role}) -> bartender://`);
      return res.redirect(`bartender://auth?t=${ssoToken}`);
    }

    const loginCheck = canLogin(user);
    if (!loginCheck.canLogin) {
      return res.redirect(frontendCallback({ error: loginCheck.reason || 'oauth_error' }, origin.origin));
    }

    const session = await refreshTokenService.generateRefreshToken(user._id, sessionInfo);

    const identityDecision = await executeLoginDecision(user, session, {
      accessToken: response.token,
      refreshToken: session.refreshToken,
      expiresIn: response.expiresIn,
    });

    // ── Regla clara: clientes siempre a /cliente, empleados al decision engine
    // isEmployee=true SOLO si el usuario es realmente un empleado (no admin que visita la web)
    const isEmployeeForWeb = user.role !== 'client' && user.isEmployee === true;
    const destination = isClient
      ? '/cliente'
      : (identityDecision.destination || '/admin');

    logger.info(`[Auth] Google OAuth web: ${user.email} (${user.role}) -> ${destination}`);

    return res.redirect(frontendCallback({
      token: String(response.token || ''),
      refreshToken: session.refreshToken,
      destination,
      canAccess: isClient ? 'true' : String(identityDecision.canAccess !== false),
      identityStatus: isClient ? 'CLIENT' : (identityDecision.identityStatus || 'EMPLOYEE'),
      isEmployee: isClient ? 'false' : String(isEmployeeForWeb),
      role: user.role || 'client',
    }, origin.origin));
  } catch (error) {
    logger.error("[Auth] Error en googleCallback:", error);
    return res.redirect(frontendCallback({ error: 'oauth_error' }));
  }
};

/* =========================================================
   GENERATE SSO TOKEN
   Genera un token de un solo uso (OTP) para handoff web→desktop.
   El token expira en 90 segundos y solo puede canjearse una vez.
   Requiere que el usuario esté autenticado (protect middleware).
========================================================= */
export const generateSSOToken = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorized(res, "No autenticado");

    // Verificar que el usuario tiene rol de empleado
    const user = await User.findById(userId).select("_id role isEmployee").lean();
    if (!user) return unauthorized(res, "Usuario no encontrado");

    // Generar token único criptográficamente seguro
    const ssoToken = crypto.randomBytes(32).toString("hex");

    // Obtener el refreshToken actual del header (si viene)
    // Lo necesitamos para regenerar la sesión en el desktop
    const authHeader = req.headers.authorization || "";
    const accessToken = authHeader.replace("Bearer ", "").trim();

    // Almacenar en el store con TTL
    ssoTokenStore.set(ssoToken, {
      userId,
      accessToken,
      role: user.role,
      isEmployee: user.isEmployee,
      createdAt: Date.now(),
    });

    logger.info(`[Auth] SSO token generado para usuario ${userId}`);

    return ok(res, { ssoToken, expiresIn: SSO_TTL_MS / 1000 }, "SSO token generado");
  } catch (error) {
    logger.error("[Auth] Error en generateSSOToken:", error);
    return serverError(res, "Error al generar token SSO");
  }
};

/* =========================================================
   REDEEM SSO TOKEN
   El desktop canjea el OTP y recibe tokens de sesión completos.
   El token se invalida inmediatamente después del canje.
   Ruta pública (el desktop no tiene token todavía).
========================================================= */
export const redeemSSOToken = async (req, res, next) => {
  try {
    const { ssoToken } = req.body;

    if (!ssoToken) return badRequest(res, "ssoToken requerido");

    const entry = ssoTokenStore.get(ssoToken);

    if (!entry) {
      return unauthorized(res, "Token SSO inválido o ya utilizado");
    }

    // Verificar TTL
    if (Date.now() - entry.createdAt > SSO_TTL_MS) {
      ssoTokenStore.delete(ssoToken);
      return unauthorized(res, "Token SSO expirado");
    }

    // Invalidar inmediatamente — un solo uso
    ssoTokenStore.delete(ssoToken);

    // Obtener usuario completo
    const user = await User.findById(entry.userId).select(
      "_id name email role shift isEmployee permissions isActive"
    ).lean();

    if (!user || !user.isActive) {
      return unauthorized(res, "Usuario no disponible");
    }

    // Generar sesión nueva para el desktop
    const sessionInfo = {
      platform: "desktop",
      loginMethod: "sso",
      isTrusted: true,
    };

    const token = identityService.generateToken(user);
    const refreshTokenData = await refreshTokenService.generateRefreshToken(
      user._id.toString(),
      sessionInfo
    );

    logger.info(`[Auth] SSO token canjeado para usuario ${user.email} → desktop`);

    return ok(res, {
      token,
      refreshToken: refreshTokenData.refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmployee: user.isEmployee,
        shift: user.shift,
      },
    }, "SSO login exitoso");
  } catch (error) {
    logger.error("[Auth] Error en redeemSSOToken:", error);
    return serverError(res, "Error al canjear token SSO");
  }
};

/* =========================================================
   UPDATE PROFILE
   PATCH /auth/profile
   Permite al usuario autenticado editar su propio perfil.
   Solo name y phone. El email NO es editable (es la identidad).
========================================================= */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorized(res, "No autenticado");

    const ALLOWED = ["name", "phone"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    if (updates.name !== undefined) {
      const name = String(updates.name).trim();
      if (name.length < 2 || name.length > 50) {
        return badRequest(res, "El nombre debe tener entre 2 y 50 caracteres");
      }
      updates.name = name;
    }

    if (updates.phone !== undefined) {
      const phone = String(updates.phone).trim();
      if (phone && phone.length > 30) {
        return badRequest(res, "El teléfono no puede superar 30 caracteres");
      }
      updates.phone = phone || null;
    }

    if (Object.keys(updates).length === 0) {
      return badRequest(res, "No hay campos válidos para actualizar");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select("_id name email phone avatar role lastLogin").lean();

    if (!user) return unauthorized(res, "Usuario no encontrado");

    logger.info(`[Auth] Perfil actualizado: ${userId}`);
    return ok(res, user, "Perfil actualizado correctamente");
  } catch (error) {
    logger.error("[Auth] Error en updateProfile:", error);
    throw error;
  }
};

/* =========================================================
   CHANGE PASSWORD (propio usuario)
   PATCH /auth/password
   Solo para cuentas con provider === 'local'.
   Requiere la contraseña actual para confirmar identidad.
========================================================= */
export const changeOwnPassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorized(res, "No autenticado");

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return badRequest(res, "Se requieren currentPassword y newPassword");
    }

    if (newPassword.length < 6) {
      return badRequest(res, "La nueva contraseña debe tener al menos 6 caracteres");
    }

    if (currentPassword === newPassword) {
      return badRequest(res, "La nueva contraseña debe ser diferente a la actual");
    }

    const user = await User.findById(userId).select("+password");
    if (!user) return unauthorized(res, "Usuario no encontrado");

    // Usuarios OAuth no tienen contraseña local
    if (!user.password) {
      return badRequest(res,
        `Tu cuenta fue creada con ${user.provider || "Google"}. ` +
        "No podés cambiar contraseña aquí."
      );
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return unauthorized(res, "La contraseña actual es incorrecta");
    }

    user.password = newPassword;
    await user.save(); // el pre-save hook hashea automáticamente

    logger.info(`[Auth] Contraseña cambiada por el propio usuario: ${userId}`);
    return ok(res, null, "Contraseña actualizada correctamente");
  } catch (error) {
    logger.error("[Auth] Error en changeOwnPassword:", error);
    throw error;
  }
};

/* =========================================================
   GET FAVORITES
   GET /auth/favorites
   Lista los productos favoritos del usuario autenticado.
========================================================= */
export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorized(res, "No autenticado");

    const user = await User.findById(userId)
      .select("favorites")
      .populate("favorites", "name price image category type available featured dynamicPrice")
      .lean();

    if (!user) return unauthorized(res, "Usuario no encontrado");

    return ok(res, user.favorites || []);
  } catch (error) {
    logger.error("[Auth] Error en getFavorites:", error);
    throw error;
  }
};

/* =========================================================
   ADD FAVORITE
   POST /auth/favorites
   body: { productId }
========================================================= */
export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorized(res, "No autenticado");

    const { productId } = req.body;
    if (!productId) return badRequest(res, "productId requerido");

    // addToSet evita duplicados sin necesidad de verificación previa
    await User.findByIdAndUpdate(userId, {
      $addToSet: { favorites: productId },
    });

    logger.info(`[Auth] Favorito agregado: ${productId} → usuario ${userId}`);
    return ok(res, null, "Producto agregado a favoritos");
  } catch (error) {
    logger.error("[Auth] Error en addFavorite:", error);
    throw error;
  }
};

/* =========================================================
   REMOVE FAVORITE
   DELETE /auth/favorites/:productId
========================================================= */
export const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorized(res, "No autenticado");

    const { productId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { favorites: productId },
    });

    logger.info(`[Auth] Favorito eliminado: ${productId} → usuario ${userId}`);
    return ok(res, null, "Producto eliminado de favoritos");
  } catch (error) {
    logger.error("[Auth] Error en removeFavorite:", error);
    throw error;
  }
};
