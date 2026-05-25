import { Router } from "express";
import {
  checkIn,
  checkOut,
  getUserAttendance,
  getTodayAttendance,
  getAttendanceStats,
  updateAttendance,
  requestLeave,
  handleLeaveRequest,
} from "../controllers/attendance.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

/* =========================================================
   ATTENDANCE ROUTES
========================================================= */

// Check-in / Check-out
router.post("/check-in", protect, authorizeRoles("admin", "manager", "bartender", "waiter", "cashier", "kitchen"), checkIn);
router.post("/check-out", protect, authorizeRoles("admin", "manager", "bartender", "waiter", "cashier", "kitchen"), checkOut);

// Get attendance data
router.get("/user/:userId", protect, authorizeRoles("admin", "manager"), getUserAttendance);
router.get("/today", protect, authorizeRoles("admin", "manager", "bartender", "waiter"), getTodayAttendance);
router.get("/stats", protect, authorizeRoles("admin", "manager"), getAttendanceStats);

// Update attendance (admin only)
router.patch("/:attendanceId", protect, authorizeRoles("admin", "manager"), updateAttendance);

// Leave management
router.post("/leave/request", protect, authorizeRoles("admin", "manager", "bartender", "waiter", "cashier", "kitchen"), requestLeave);
router.patch("/leave/:userId", protect, authorizeRoles("admin", "manager"), handleLeaveRequest);

export default router;
