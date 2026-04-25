import jwt    from "jsonwebtoken";
import User   from "../models/User.js";
import { logger } from "../config/logger.js";
import {
  ok, created, badRequest,
  unauthorized, forbidden, conflict, serverError,
} from "../utils/response.js";

/* =========================================================
   TOKEN GENERATOR
========================================================= */
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, shift: user.shift || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

/* =========================================================
   SAFE USER PAYLOAD
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
    next(error);
  }
};

/* =========================================================
   LOGIN
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
      return res.status(423).json({
        success: false,
        message: `Cuenta bloqueada. Intenta en ${minutesLeft} minuto(s)`,
      });
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
    next(error);
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
    next(error);
  }
};