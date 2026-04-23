import mongoose from "mongoose";
import User from "../models/User.js";

/* =========================================================
   HELPERS
========================================================= */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendError = (res, status, message, detail = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(detail && { detail }),
  });
};

const sendSuccess = (res, data, message = "OK") => {
  return res.json({
    success: true,
    message,
    data,
  });
};

/* =========================================================
   CREATE EMPLOYEE
   (ADMIN ONLY)
========================================================= */
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      shift = null,
      permissions = {},
    } = req.body;

    if (!name || !email || !password || !role) {
      return sendError(res, 400, "Datos incompletos");
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return sendError(res, 409, "El usuario ya existe");
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      shift,
      permissions,
      isActive: true,
    });

    return sendSuccess(res, user, "Empleado creado correctamente");
  } catch (error) {
    return sendError(res, 500, "Error creando usuario", error.message);
  }
};

/* =========================================================
   GET EMPLOYEES
   (ADMIN ONLY)
========================================================= */
export const getEmployees = async (req, res) => {
  try {
    const { role, shift, active } = req.query;

    const filter = {
      role: { $ne: "client" },
    };

    if (role) filter.role = role;
    if (shift) filter.shift = shift;

    if (active !== undefined) {
      filter.isActive = active === "true";
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return sendSuccess(res, users);
  } catch (error) {
    return sendError(res, 500, "Error obteniendo empleados", error.message);
  }
};

/* =========================================================
   GET USER BY ID
========================================================= */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, "ID inválido");
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return sendError(res, 404, "Usuario no encontrado");
    }

    return sendSuccess(res, user);
  } catch (error) {
    return sendError(res, 500, "Error obteniendo usuario", error.message);
  }
};

/* =========================================================
   UPDATE USER (GENERAL SAFE UPDATE)
========================================================= */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, "ID inválido");
    }

    const allowedFields = [
      "name",
      "role",
      "shift",
      "permissions",
      "isActive",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return sendError(res, 404, "Usuario no encontrado");
    }

    return sendSuccess(res, user, "Usuario actualizado");
  } catch (error) {
    return sendError(res, 500, "Error actualizando usuario", error.message);
  }
};

/* =========================================================
   CHANGE PASSWORD
========================================================= */
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!isValidId(id)) {
      return sendError(res, 400, "ID inválido");
    }

    if (!password) {
      return sendError(res, 400, "Password requerido");
    }

    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, "Usuario no encontrado");
    }

    user.password = password;
    await user.save();

    return sendSuccess(res, null, "Password actualizado");
  } catch (error) {
    return sendError(res, 500, "Error cambiando password", error.message);
  }
};

/* =========================================================
   ACTIVATE / DEACTIVATE
========================================================= */
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) return sendError(res, 404, "Usuario no encontrado");

    return sendSuccess(res, user, "Usuario desactivado");
  } catch (error) {
    return sendError(res, 500, "Error desactivando usuario", error.message);
  }
};

export const activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select("-password");

    if (!user) return sendError(res, 404, "Usuario no encontrado");

    return sendSuccess(res, user, "Usuario activado");
  } catch (error) {
    return sendError(res, 500, "Error activando usuario", error.message);
  }
};

/* =========================================================
   PERMISSIONS SYSTEM (CORE FEATURE)
========================================================= */
export const updatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== "object") {
      return sendError(res, 400, "Permissions inválidos");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    ).select("-password");

    if (!user) return sendError(res, 404, "Usuario no encontrado");

    return sendSuccess(res, user, "Permisos actualizados");
  } catch (error) {
    return sendError(res, 500, "Error actualizando permisos", error.message);
  }
};

/* =========================================================
   SHIFT SYSTEM (TURNOS OPERATIVOS)
========================================================= */
export const assignShift = async (req, res) => {
  try {
    const { shift } = req.body;

    if (!shift) {
      return sendError(res, 400, "Shift requerido");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { shift },
      { new: true }
    ).select("-password");

    if (!user) return sendError(res, 404, "Usuario no encontrado");

    return sendSuccess(res, user, "Turno asignado");
  } catch (error) {
    return sendError(res, 500, "Error asignando turno", error.message);
  }
};