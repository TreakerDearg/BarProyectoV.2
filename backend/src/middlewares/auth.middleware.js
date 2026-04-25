import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =========================================================
   TOKEN
========================================================= */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

/* =========================================================
   PROTECT
========================================================= */
export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: "Token requerido" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Token inválido" });
    }

    const user = await User.findById(decoded.id).select(
      "_id name email role permissions isActive shift lockUntil"
    );

    if (!user) {
      return res.status(401).json({ message: "Usuario no existe" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Usuario desactivado" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ message: "Usuario bloqueado" });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      shift: user.shift,
      isActive: user.isActive,
      permissions: user.permissions || {},
    };

    next();
  } catch (err) {
    return res.status(500).json({
      message: "Error auth",
      error: err.message,
    });
  }
};

/* =========================================================
   ROLE MIDDLEWARE (🔥 ESTE ES EL QUE TE FALTA EXPORTAR)
========================================================= */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ message: "Usuario desactivado" });
      }

      if (allowedRoles.length === 0) return next();

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Rol no autorizado",
          required: allowedRoles,
          current: req.user.role,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        message: "Error roles",
        error: err.message,
      });
    }
  };
};

/* =========================================================
   PERMISSIONS
========================================================= */
export const authorizePermissions = (...required) => {
  return (req, res, next) => {
    const perms = req.user?.permissions || {};

    const missing = required.filter((p) => perms[p] !== true);

    if (missing.length > 0) {
      return res.status(403).json({
        message: "Sin permisos",
        missing,
      });
    }

    next();
  };
};