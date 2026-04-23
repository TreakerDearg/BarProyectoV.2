import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =========================================================
   PROTECT (JWT AUTH CORE)
========================================================= */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token no proporcionado",
      });
    }

    const token = authHeader.split(" ")[1];

    /* =========================
       VERIFY TOKEN
    ========================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* =========================
       FIND USER
    ========================= */
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Usuario no existe",
      });
    }

    /* =========================
       STATUS CHECK
    ========================= */
    if (!user.isActive) {
      return res.status(403).json({
        message: "Usuario desactivado",
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Usuario bloqueado temporalmente",
      });
    }

    /* =========================
       ATTACH USER
    ========================= */
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};

/* =========================================================
   RBAC (ROLES)
========================================================= */
export const authorizeRoles = (...rolesAllowed) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!rolesAllowed.includes(req.user.role)) {
      return res.status(403).json({
        message: "Rol no autorizado",
        required: rolesAllowed,
        current: req.user.role,
      });
    }

    next();
  };
};

/* =========================================================
   PERMISSIONS (FUTURE PRO SYSTEM)
========================================================= */
export const authorizePermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const userPermissions = req.user.permissions || {};

    const hasPermission = permissions.every(
      (perm) => userPermissions[perm] === true
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: "Permisos insuficientes",
        required: permissions,
      });
    }

    next();
  };
};

/* =========================================================
   SHIFT ACCESS (TURNOS)
========================================================= */
export const authorizeShift = (...allowedShifts) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!req.user.shift) {
      return res.status(403).json({
        message: "Usuario sin turno asignado",
      });
    }

    if (!allowedShifts.includes(req.user.shift)) {
      return res.status(403).json({
        message: "Acceso no permitido en este turno",
        current: req.user.shift,
      });
    }

    next();
  };
};

/* =========================================================
   ADMIN SHORTCUT
========================================================= */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Solo administradores",
    });
  }

  next();
};