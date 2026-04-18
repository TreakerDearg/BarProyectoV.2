import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ==============================
   PROTECT (JWT)
============================== */
export const protect = async (req, res, next) => {
  try {
    let token;

    /* =========================
       GET TOKEN
    ========================= */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "No autorizado, token faltante",
      });
    }

    /* =========================
       VERIFY TOKEN
    ========================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* =========================
       GET USER
    ========================= */
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Usuario no encontrado",
      });
    }

    /* =========================
       USER DISABLED
    ========================= */
    if (!user.isActive) {
      return res.status(403).json({
        message: "Usuario desactivado",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    /* =========================
       ERROR HANDLING
    ========================= */
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expirado",
      });
    }

    return res.status(401).json({
      message: "Token inválido",
    });
  }
};

/* ==============================
   AUTHORIZE ROLES
============================== */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Acceso denegado",
      });
    }

    next();
  };
};