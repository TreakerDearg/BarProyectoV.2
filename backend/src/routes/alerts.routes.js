import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  createAlert,
  getAlerts,
  updateAlert,
  deleteAlert,
  testAlert,
} from '../controllers/alerts.controller.js';

const router = express.Router();

// All alert routes require authentication and admin role
router.use(protect);
router.use(authorizeRoles('admin', 'manager'));

/**
 * @route   POST /api/alerts
 * @desc    Create a custom alert
 * @access  Private (Admin/Manager)
 */
router.post('/', createAlert);

/**
 * @route   GET /api/alerts
 * @desc    Get all custom alerts
 * @access  Private (Admin/Manager)
 */
router.get('/', getAlerts);

/**
 * @route   PUT /api/alerts/:id
 * @desc    Update an alert
 * @access  Private (Admin/Manager)
 */
router.put('/:id', updateAlert);

/**
 * @route   DELETE /api/alerts/:id
 * @desc    Delete an alert
 * @access  Private (Admin/Manager)
 */
router.delete('/:id', deleteAlert);

/**
 * @route   POST /api/alerts/test
 * @desc    Test an alert condition
 * @access  Private (Admin/Manager)
 */
router.post('/test', testAlert);

export default router;
