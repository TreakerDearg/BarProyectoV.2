import express from 'express';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  exportAuditLogs,
  getAuditLogs,
  clearAuditLogs,
} from '../controllers/audit.controller.js';

const router = express.Router();

// All audit routes require authentication and admin role
router.use(protect);
router.use(authorizeRoles('admin', 'manager'));

/**
 * @route   GET /api/audit
 * @desc    Get audit logs with pagination and filtering
 * @access  Private (Admin/Manager)
 */
router.get('/', getAuditLogs);

/**
 * @route   GET /api/audit/export
 * @desc    Export audit logs to Excel format
 * @access  Private (Admin/Manager)
 */
router.get('/export', exportAuditLogs);

/**
 * @route   DELETE /api/audit/clear
 * @desc    Clear audit logs (admin only)
 * @access  Private (Admin)
 */
router.delete('/clear', authorizeRoles('admin'), clearAuditLogs);

export default router;
