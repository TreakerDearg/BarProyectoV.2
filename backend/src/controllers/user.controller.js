import mongoose from "mongoose";
import User from "../models/User.js";

/* ==============================
   HELPERS
============================== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ==============================
   CREATE EMPLOYEE (ADMIN)
============================== */
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const user = new User({
      name,
      email,
      password, 
      role,
      isActive: true,
    });

    await user.save();

    res.status(201).json({
      message: "Empleado creado correctamente",
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error creando usuario",
      detail: error.message,
    });
  }
};

/* ==============================
   GET EMPLOYEES
============================== */
export const getEmployees = async (req, res) => {
  try {
    const { role, active } = req.query;

    const filter = {
      role: { $ne: "client" },
    };

    if (role) filter.role = role;
    if (active !== undefined) {
      filter.isActive = active === "true";
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET USER BY ID
============================== */
export const getUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   UPDATE USER (SAFE)
============================== */
export const updateUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const allowedFields = ["name", "role", "isActive"];

    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   CHANGE PASSWORD (FIXED)
============================== */
export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password requerido" });
    }

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    user.password = password; 
    await user.save();

    res.json({ message: "Password actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   DEACTIVATE USER
============================== */
export const deactivateUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario desactivado", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   ACTIVATE USER
============================== */
export const activateUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario activado", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};