import express from "express";
import {
  // Activity Logging
  logActivity,
  getActivityLogs,
  getActivityMetrics,
  getRealTimeActivity,
  // KPIs
  getEmployeeKPIs,
  getAllEmployeesKPIs,
  getKPITrends,
  getEmployeeRanking,
  // Shift Management
  createShiftSchedule,
  getShiftSchedules,
  updateShiftSchedule,
  deleteShiftSchedule,
  assignEmployeeToShift,
  generateShiftAssignments,
  getShiftAssignments,
  updateShiftAssignment,
  registerShiftAttendance,
  // Shift Metrics
  getShiftMetrics,
  getShiftMetricsRange,
  getAllShiftsMetrics,
  getPeakHoursByShift,
  // Alerts
  getPerformanceAlerts,
  createPerformanceAlert,
  resolveAlert,
  // Reports
  generateEmployeeReport,
  getPerformanceSummary,
} from "../controllers/tracking.controller.js";

import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = express.Router();
const adminOnly = [protect, authorizeRoles("admin")];

/* =========================================================
   ACTIVITY LOGGING
========================================================= */
router.post("/activity", ...adminOnly, asyncHandler(logActivity));
router.get("/activity", ...adminOnly, asyncHandler(getActivityLogs));
router.get("/activity/metrics", ...adminOnly, asyncHandler(getActivityMetrics));
router.get("/activity/realtime", ...adminOnly, asyncHandler(getRealTimeActivity));
router.get("/activity/:userId/metrics", ...adminOnly, asyncHandler(getActivityMetrics));

/* =========================================================
   EMPLOYEE KPIs
========================================================= */
router.get("/kpis", ...adminOnly, asyncHandler(getAllEmployeesKPIs));
router.get("/kpis/:userId", ...adminOnly, asyncHandler(getEmployeeKPIs));
router.get("/kpis/:userId/trends/:kpiType", ...adminOnly, asyncHandler(getKPITrends));
router.get("/kpis/ranking", ...adminOnly, asyncHandler(getEmployeeRanking));

/* =========================================================
   SHIFT SCHEDULES
========================================================= */
router.post("/shifts/schedules", ...adminOnly, asyncHandler(createShiftSchedule));
router.get("/shifts/schedules", ...adminOnly, asyncHandler(getShiftSchedules));
router.put("/shifts/schedules/:id", ...adminOnly, asyncHandler(updateShiftSchedule));
router.delete("/shifts/schedules/:id", ...adminOnly, asyncHandler(deleteShiftSchedule));

/* =========================================================
   SHIFT ASSIGNMENTS
========================================================= */
router.post("/shifts/assignments", ...adminOnly, asyncHandler(assignEmployeeToShift));
router.post("/shifts/assignments/generate", ...adminOnly, asyncHandler(generateShiftAssignments));
router.get("/shifts/assignments", ...adminOnly, asyncHandler(getShiftAssignments));
router.put("/shifts/assignments/:id", ...adminOnly, asyncHandler(updateShiftAssignment));
router.post("/shifts/assignments/:id/attendance", ...adminOnly, asyncHandler(registerShiftAttendance));

/* =========================================================
   SHIFT METRICS
========================================================= */
router.get("/shifts/metrics/:shiftType/:date", ...adminOnly, asyncHandler(getShiftMetrics));
router.get("/shifts/metrics/:shiftType", ...adminOnly, asyncHandler(getShiftMetricsRange));
router.get("/shifts/metrics", ...adminOnly, asyncHandler(getAllShiftsMetrics));
router.get("/shifts/peak-hours/:shiftType", ...adminOnly, asyncHandler(getPeakHoursByShift));

/* =========================================================
   ALERTS
========================================================= */
router.get("/alerts", ...adminOnly, asyncHandler(getPerformanceAlerts));
router.post("/alerts", ...adminOnly, asyncHandler(createPerformanceAlert));
router.patch("/alerts/:id/resolve", ...adminOnly, asyncHandler(resolveAlert));

/* =========================================================
   REPORTS
========================================================= */
router.post("/reports/employee/:userId", ...adminOnly, asyncHandler(generateEmployeeReport));
router.post("/reports/shift/:shiftType", ...adminOnly, asyncHandler(generateEmployeeReport)); // Usar mismo controller por ahora
router.get("/reports/summary", ...adminOnly, asyncHandler(getPerformanceSummary));

export default router;
