import express from "express";
import {
  createEmployee, getEmployees, getUser, updateUser,
  deactivateUser, activateUser, changePassword,
  updatePermissions, assignShift,
} from "../controllers/user.controller.js";

import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createEmployeeSchema,
  assignShiftSchema,
  changePasswordSchema,
  updateUserSchema,
  updatePermissionsSchema,
} from "../utils/schemas.js";

const router = express.Router();
const adminOnly = [protect, authorizeRoles("admin")];

/* =========================================================
   EMPLOYEES MODULE
========================================================= */
router.post("/employees", ...adminOnly, validate(createEmployeeSchema), createEmployee);
router.get("/employees", ...adminOnly, getEmployees);

/* =========================================================
   USER CORE MANAGEMENT
========================================================= */
router.get("/:id", ...adminOnly, getUser);
router.put("/:id", ...adminOnly, validate(updateUserSchema), updateUser);

/* =========================================================
   SECURITY & STATUS
========================================================= */
router.patch("/:id/password", ...adminOnly, validate(changePasswordSchema), changePassword);
router.patch("/:id/deactivate", ...adminOnly, deactivateUser);
router.patch("/:id/activate", ...adminOnly, activateUser);

/* =========================================================
   PERMISSIONS & SHIFTS
========================================================= */
router.patch("/:id/permissions", ...adminOnly, validate(updatePermissionsSchema), updatePermissions);
router.patch("/:id/shift", ...adminOnly, validate(assignShiftSchema), assignShift);

export default router;