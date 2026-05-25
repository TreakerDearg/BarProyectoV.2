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

const router = express.Router();
const adminOnly = [protect, authorizeRoles("admin")];

/* =========================================================
   ACTIVITY LOGGING
========================================================= */
router.post("/activity", ...adminOnly, logActivity);
router.get("/activity", ...adminOnly, getActivityLogs);
router.get("/activity/metrics", ...adminOnly, getActivityMetrics);
router.get("/activity/realtime", ...adminOnly, getRealTimeActivity);
router.get("/activity/:userId/metrics", ...adminOnly, getActivityMetrics);

/* =========================================================
   EMPLOYEE KPIs
========================================================= */
router.get("/kpis", ...adminOnly, getAllEmployeesKPIs);
router.get("/kpis/:userId", ...adminOnly, getEmployeeKPIs);
router.get("/kpis/:userId/trends/:kpiType", ...adminOnly, getKPITrends);
router.get("/kpis/ranking", ...adminOnly, getEmployeeRanking);

/* =========================================================
   SHIFT SCHEDULES
========================================================= */
router.post("/shifts/schedules", ...adminOnly, createShiftSchedule);
router.get("/shifts/schedules", ...adminOnly, getShiftSchedules);
router.put("/shifts/schedules/:id", ...adminOnly, updateShiftSchedule);
router.delete("/shifts/schedules/:id", ...adminOnly, deleteShiftSchedule);

/* =========================================================
   SHIFT ASSIGNMENTS
========================================================= */
router.post("/shifts/assignments", ...adminOnly, assignEmployeeToShift);
router.post("/shifts/assignments/generate", ...adminOnly, generateShiftAssignments);
router.get("/shifts/assignments", ...adminOnly, getShiftAssignments);
router.put("/shifts/assignments/:id", ...adminOnly, updateShiftAssignment);
router.post("/shifts/assignments/:id/attendance", ...adminOnly, registerShiftAttendance);

/* =========================================================
   SHIFT METRICS
========================================================= */
router.get("/shifts/metrics/:shiftType/:date", ...adminOnly, getShiftMetrics);
router.get("/shifts/metrics/:shiftType", ...adminOnly, getShiftMetricsRange);
router.get("/shifts/metrics", ...adminOnly, getAllShiftsMetrics);
router.get("/shifts/peak-hours/:shiftType", ...adminOnly, getPeakHoursByShift);

/* =========================================================
   ALERTS
========================================================= */
router.get("/alerts", ...adminOnly, getPerformanceAlerts);
router.post("/alerts", ...adminOnly, createPerformanceAlert);
router.patch("/alerts/:id/resolve", ...adminOnly, resolveAlert);

/* =========================================================
   REPORTS
========================================================= */
router.post("/reports/employee/:userId", ...adminOnly, generateEmployeeReport);
router.post("/reports/shift/:shiftType", ...adminOnly, generateEmployeeReport); // Usar mismo controller por ahora
router.get("/reports/summary", ...adminOnly, getPerformanceSummary);

export default router;
