import { Router } from "express";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  exportDatabaseBackup,
  getBackupStats,
  restoreDatabaseBackup,
} from "../controllers/backup.controller.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

router.get("/export", ...adminOnly, exportDatabaseBackup);
router.get("/stats", ...adminOnly, getBackupStats);
router.post("/restore", ...adminOnly, restoreDatabaseBackup);

export default router;
