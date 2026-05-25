import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logger } from "../config/logger.js";

/* =========================================================
   TOKEN EXTRACTION
========================================================= */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

/* =========================================================
   TOKEN VALIDATION
========================================================= */
const validateToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expirado");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Token inválido");
    }
    throw new Error("Error de validación de token");
  }
};

/* =========================================================
   PROTECT MIDDLEWARE - Autenticación mejorada
========================================================= */
export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      logger.warn("[Auth] Intento de acceso sin token", {
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({ 
        success: false,
        message: "Token requerido",
        code: "TOKEN_MISSING"
      });
    }

    let decoded;
    try {
      decoded = validateToken(token);
    } catch (error) {
      logger.warn("[Auth] Token inválido", {
        ip: req.ip,
        path: req.path,
        error: error.message,
      });
      return res.status(401).json({ 
        success: false,
        message: error.message,
        code: "TOKEN_INVALID"
      });
    }

    const user = await User.findById(decoded.id).select(
      "_id name email role permissions isActive shift lockUntil lastLogin failedLoginAttempts"
    );

    if (!user) {
      logger.warn("[Auth] Usuario no encontrado", {
        userId: decoded.id,
        ip: req.ip,
      });
      return res.status(401).json({ 
        success: false,
        message: "Usuario no existe",
        code: "USER_NOT_FOUND"
      });
    }

    if (!user.isActive) {
      logger.warn("[Auth] Usuario desactivado", {
        userId: user._id,
        email: user.email,
        ip: req.ip,
      });
      return res.status(403).json({ 
        success: false,
        message: "Usuario desactivado",
        code: "USER_INACTIVE"
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      logger.warn("[Auth] Usuario bloqueado temporalmente", {
        userId: user._id,
        email: user.email,
        lockUntil: new Date(user.lockUntil),
        ip: req.ip,
      });
      return res.status(403).json({ 
        success: false,
        message: "Usuario bloqueado temporalmente",
        code: "USER_LOCKED",
        lockUntil: user.lockUntil
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      shift: user.shift,
      isActive: user.isActive,
      permissions: user.permissions || {},
      lastLogin: user.lastLogin,
    };

    logger.info("[Auth] Usuario autenticado exitosamente", {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip,
    });

    next();
  } catch (err) {
    logger.error("[Auth] Error en middleware de protección", {
      error: err.message,
      stack: err.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Error de autenticación",
      code: "AUTH_ERROR"
    });
  }
};

/* =========================================================
   OPTIONAL AUTH - Autenticación opcional
========================================================= */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(); // Continuar sin autenticación
    }

    let decoded;
    try {
      decoded = validateToken(token);
    } catch {
      return next(); // Token inválido, continuar sin autenticación
    }

    const user = await User.findById(decoded.id).select(
      "_id name email role permissions isActive shift"
    );

    if (user && user.isActive) {
      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        shift: user.shift,
        isActive: user.isActive,
        permissions: user.permissions || {},
      };
    }

    next();
  } catch (err) {
    // Continuar sin fallar en caso de error
    next();
  }
};

/* =========================================================
   ROLE AUTHORIZATION - Autorización por roles
========================================================= */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn("[Auth] Verificación de roles sin usuario autenticado", {
          path: req.path,
          requiredRoles: allowedRoles,
        });
        return res.status(401).json({ 
          success: false,
          message: "No autenticado",
          code: "NOT_AUTHENTICATED"
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ 
          success: false,
          message: "Usuario desactivado",
          code: "USER_INACTIVE"
        });
      }

      if (allowedRoles.length === 0) return next();

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn("[Auth] Rol no autorizado", {
          userId: req.user.id,
          role: req.user.role,
          requiredRoles: allowedRoles,
          path: req.path,
        });
        return res.status(403).json({
          success: false,
          message: "Rol no autorizado",
          code: "ROLE_NOT_ALLOWED",
          required: allowedRoles,
          current: req.user.role,
        });
      }

      next();
    } catch (err) {
      logger.error("[Auth] Error en verificación de roles", {
        error: err.message,
      });
      return res.status(500).json({
        success: false,
        message: "Error de verificación de roles",
        code: "ROLE_CHECK_ERROR"
      });
    }
  };
};

/* =========================================================
   PERMISSIONS AUTHORIZATION - Autorización por permisos
========================================================= */
export const authorizePermissions = (...required) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: "No autenticado",
          code: "NOT_AUTHENTICATED"
        });
      }

      const perms = req.user?.permissions || {};
      const missing = required.filter((p) => perms[p] !== true);

      if (missing.length > 0) {
        logger.warn("[Auth] Permisos insuficientes", {
          userId: req.user.id,
          role: req.user.role,
          required: required,
          missing: missing,
          path: req.path,
        });
        return res.status(403).json({
          success: false,
          message: "Permisos insuficientes",
          code: "PERMISSION_DENIED",
          missing,
        });
      }

      next();
    } catch (err) {
      logger.error("[Auth] Error en verificación de permisos", {
        error: err.message,
      });
      return res.status(500).json({
        success: false,
        message: "Error de verificación de permisos",
        code: "PERMISSION_CHECK_ERROR"
      });
    }
  };
};

/* =========================================================
   SHIFT VALIDATION - Validación de turno
========================================================= */
export const validateShift = (allowedShifts = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: "No autenticado",
          code: "NOT_AUTHENTICATED"
        });
      }

      if (allowedShifts.length === 0) return next();

      if (!allowedShifts.includes(req.user.shift)) {
        logger.warn("[Auth] Turno no autorizado", {
          userId: req.user.id,
          shift: req.user.shift,
          requiredShifts: allowedShifts,
          path: req.path,
        });
        return res.status(403).json({
          success: false,
          message: "Turno no autorizado",
          code: "SHIFT_NOT_ALLOWED",
          required: allowedShifts,
          current: req.user.shift,
        });
      }

      next();
    } catch (err) {
      logger.error("[Auth] Error en validación de turno", {
        error: err.message,
      });
      return res.status(500).json({
        success: false,
        message: "Error de validación de turno",
        code: "SHIFT_CHECK_ERROR"
      });
    }
  };
};

/* =========================================================
   COMBINED AUTH - Autenticación y autorización combinada
========================================================= */
export const auth = (...allowedRoles) => {
  return [
    protect,
    ...allowedRoles.length > 0 ? [authorizeRoles(...allowedRoles)] : []
  ];
};