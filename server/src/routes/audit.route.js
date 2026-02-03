import express from 'express';
import { getAllLogs, getUserLogs, getAuditStats } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

// All routes require admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/audit/logs
 * @desc    Get all audit logs with pagination
 * @access  Private (admin)
 */
router.get('/logs', getAllLogs);

/**
 * @route   GET /api/audit/user/:userId
 * @desc    Get logs for specific user
 * @access  Private (admin)
 */
router.get('/user/:userId', getUserLogs);

/**
 * @route   GET /api/audit/stats
 * @desc    Get audit statistics
 * @access  Private (admin)
 */
router.get('/stats', getAuditStats);

export default router;