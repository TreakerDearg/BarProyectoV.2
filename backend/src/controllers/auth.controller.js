import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ==============================
   TOKEN GENERATOR
============================== */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    }
  );
};

/* ==============================
   REGISTER (CLIENT ONLY)
============================== */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "client", // seguridad
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    next(error);
  }
};

/* ==============================
   LOGIN (PRO)
============================== */
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

    /* =========================
       USUARIO DESACTIVADO
    ========================= */
    if (!user.isActive) {
      return res.status(403).json({
        message: "Usuario desactivado",
      });
    }

    /* =========================
       BLOQUEO POR SEGURIDAD
    ========================= */
    if (user.isLocked()) {
      return res.status(423).json({
        message: "Cuenta bloqueada temporalmente",
      });
    }

    /* =========================
       VALIDAR PASSWORD
    ========================= */
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();

      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    /* =========================
       LOGIN OK
    ========================= */
    await user.resetLoginAttempts();

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    next(error);
  }
};

/* ==============================
   PROFILE (ME)
============================== */
export const getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    lastLogin: req.user.lastLogin,
  });
};