import express from "express";
import {
  createEmployee, getEmployees, getUser, updateUser,
  deactivateUser, activateUser, changePassword,
  updatePermissions, updateRolePermissions, updateShiftPermissions, assignShift,
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
import asyncHandler from "../middlewares/asyncHandler.js";

const router = express.Router();
const adminOnly = [protect, authorizeRoles("admin")];

/* =========================================================
   EMPLOYEES MODULE
========================================================= */
router.post("/employees", ...adminOnly, validate(createEmployeeSchema), asyncHandler(createEmployee));
router.get("/employees", ...adminOnly, asyncHandler(getEmployees));

/* =========================================================
   USER CORE MANAGEMENT
========================================================= */
router.get("/:id", ...adminOnly, asyncHandler(getUser));
router.put("/:id", ...adminOnly, validate(updateUserSchema), asyncHandler(updateUser));

/* =========================================================
   SECURITY & STATUS
========================================================= */
router.patch("/:id/password", ...adminOnly, validate(changePasswordSchema), asyncHandler(changePassword));
router.patch("/:id/deactivate", ...adminOnly, asyncHandler(deactivateUser));
router.patch("/:id/activate", ...adminOnly, asyncHandler(activateUser));

/* =========================================================
   PERMISSIONS & BULK ACTIONS
========================================================= */
router.patch("/role/:role/permissions", ...adminOnly, validate(updatePermissionsSchema), asyncHandler(updateRolePermissions));
router.patch("/shift/:shift/permissions", ...adminOnly, validate(updatePermissionsSchema), asyncHandler(updateShiftPermissions));
router.patch("/:id/permissions", ...adminOnly, validate(updatePermissionsSchema), asyncHandler(updatePermissions));
router.patch("/:id/shift", ...adminOnly, validate(assignShiftSchema), asyncHandler(assignShift));

export default router;