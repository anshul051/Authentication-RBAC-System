import express from 'express';
import { healthCheck, detailedHealthCheck } from '../controller/health.controller.js'; // ← Updated

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', healthCheck);

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with DB status
 * @access  Public
 */
router.get('/detailed', detailedHealthCheck); // ← New

export default router;