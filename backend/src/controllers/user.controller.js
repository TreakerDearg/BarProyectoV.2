import mongoose from "mongoose";
import User from "../models/User.js";
import { logger } from "../config/logger.js";
import {
  ok, created, badRequest, notFound, conflict, forbidden,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const EMPLOYEE_ROLES = ["admin", "bartender", "waiter", "cashier", "kitchen"];
const VALID_ROLES    = [...EMPLOYEE_ROLES, "client"];
const VALID_SHIFTS   = ["morning", "afternoon", "night", "event"];

/* =========================================================
   SAFE USER SELECT
========================================================= */
const safeSelect = "-password -refreshToken -loginAttempts -lockUntil";

/* =========================================================
   CREATE EMPLOYEE (admin only)
========================================================= */
export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, shift = null, permissions = {} } = req.body;

    if (!name || !email || !password || !role) {
      return badRequest(res, "name, email, password y role son obligatorios");
    }

    if (!VALID_ROLES.includes(role)) {
      return badRequest(res, `Rol inválido. Válidos: ${VALID_ROLES.join(", ")}`);
    }

    if (shift && !VALID_SHIFTS.includes(shift)) {
      return badRequest(res, `Turno inválido. Válidos: ${VALID_SHIFTS.join(", ")}`);
    }

    const exists = await User.findOne({ email });
    if (exists) return conflict(res, "El email ya está registrado");

    const user = await User.create({
      name, email, password, role, shift, permissions,
      isEmployee: EMPLOYEE_ROLES.includes(role),
      isActive: true,
    });

    logger.info(`[User] Empleado creado: ${email} (${role})`);

    const userObj = user.toJSON();
    return created(res, userObj, "Empleado creado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   GET EMPLOYEES
========================================================= */
export const getEmployees = async (req, res, next) => {
  try {
    const { role, shift, active } = req.query;

    const filter = { isEmployee: true, deletedAt: null };
    if (role)             filter.role     = role;
    if (shift)            filter.shift    = shift;
    if (active !== undefined) filter.isActive = active === "true";

    const users = await User.find(filter)
      .select(safeSelect)
      .sort({ name: 1 })
      .lean();

    return ok(res, users);
  } catch (error) { next(error); }
};

/* =========================================================
   GET USER BY ID
========================================================= */
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const user = await User.findById(id).select(safeSelect).lean();
    if (!user) return notFound(res, "Usuario no encontrado");

    return ok(res, user);
  } catch (error) { next(error); }
};

/* =========================================================
   UPDATE USER
========================================================= */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const ALLOWED = ["name", "role", "shift", "permissions", "isActive"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    if (Object.keys(updates).length === 0) {
      return badRequest(res, "No hay campos válidos para actualizar");
    }

    if (updates.role && !VALID_ROLES.includes(updates.role)) {
      return badRequest(res, `Rol inválido. Válidos: ${VALID_ROLES.join(", ")}`);
    }

    /* Sincronizar isEmployee automáticamente al cambiar rol */
    if (updates.role) {
      updates.isEmployee = EMPLOYEE_ROLES.includes(updates.role);
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true, runValidators: true,
    }).select(safeSelect).lean();

    if (!user) return notFound(res, "Usuario no encontrado");

    logger.info(`[User] Actualizado: ${id}`);
    return ok(res, user, "Usuario actualizado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   CHANGE PASSWORD
========================================================= */
export const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!isValidId(id)) return badRequest(res, "ID inválido");
    if (!password || password.length < 6) {
      return badRequest(res, "La contraseña debe tener al menos 6 caracteres");
    }

    const user = await User.findById(id);
    if (!user) return notFound(res, "Usuario no encontrado");

    user.password = password;
    await user.save();

    logger.info(`[User] Contraseña cambiada para: ${id}`);
    return ok(res, null, "Contraseña actualizada correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   ACTIVATE / DEACTIVATE
========================================================= */
export const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    /* Proteger al admin actual */
    if (req.user?.id === id) {
      return forbidden(res, "No puedes desactivar tu propia cuenta");
    }

    const user = await User.findByIdAndUpdate(
      id, { isActive: false, deletedAt: new Date() }, { new: true }
    ).select(safeSelect).lean();

    if (!user) return notFound(res, "Usuario no encontrado");

    logger.info(`[User] Desactivado: ${id}`);
    return ok(res, user, "Usuario desactivado");
  } catch (error) { next(error); }
};

export const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const user = await User.findByIdAndUpdate(
      id, { isActive: true, deletedAt: null, loginAttempts: 0, lockUntil: null },
      { new: true }
    ).select(safeSelect).lean();

    if (!user) return notFound(res, "Usuario no encontrado");

    logger.info(`[User] Activado: ${id}`);
    return ok(res, user, "Usuario activado correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   UPDATE PERMISSIONS
========================================================= */
export const updatePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!isValidId(id)) return badRequest(res, "ID inválido");
    if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
      return badRequest(res, "permissions debe ser un objeto válido");
    }

    const user = await User.findByIdAndUpdate(
      id, { permissions }, { new: true }
    ).select(safeSelect).lean();

    if (!user) return notFound(res, "Usuario no encontrado");

    logger.info(`[User] Permisos actualizados: ${id}`);
    return ok(res, user, "Permisos actualizados correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   ASSIGN SHIFT
========================================================= */
export const assignShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shift } = req.body;

    if (!isValidId(id)) return badRequest(res, "ID inválido");
    if (!shift || !VALID_SHIFTS.includes(shift)) {
      return badRequest(res, `Turno inválido. Válidos: ${VALID_SHIFTS.join(", ")}`);
    }

    const user = await User.findByIdAndUpdate(
      id, { shift }, { new: true }
    ).select(safeSelect).lean();

    if (!user) return notFound(res, "Usuario no encontrado");

    logger.info(`[User] Turno asignado: ${shift} → ${id}`);
    return ok(res, user, `Turno ${shift} asignado correctamente`);
  } catch (error) { next(error); }
};