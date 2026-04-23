import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =========================================================
   TOKEN GENERATOR (FULL CONTEXT)
========================================================= */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      shift: user.shift || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    }
  );
};

/* =========================================================
   REGISTER (CLIENT ONLY)
========================================================= */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({
        message: "El usuario ya existe",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "client",
      isActive: true,
      permissions: {},
      shift: null,
    });

    return res.status(201).json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shift: user.shift,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   LOGIN (MAIN AUTH FLOW)
========================================================= */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña requeridos",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Usuario desactivado",
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: "Cuenta bloqueada temporalmente",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    await user.resetLoginAttempts();

    user.lastLogin = new Date();
    await user.save();

    return res.json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shift: user.shift,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   PROFILE (ME)
========================================================= */
export const getProfile = async (req, res) => {
  return res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    shift: req.user.shift,
    permissions: req.user.permissions,
    lastLogin: req.user.lastLogin,
    isActive: req.user.isActive,
  });
};