import express from 'express';
import { healthCheck, detailedHealthCheck } from '../controller/health.controller.js';

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Basic health check - fast, lightweight
 * @access  Public
 * @usage   Used by load balancers for quick status checks
 */
router.get('/', healthCheck);

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check - includes DB status, memory, uptime
 * @access  Public (consider protecting in production with API key)
 * @usage   Used by monitoring dashboards and DevOps tools
 */
router.get('/detailed', detailedHealthCheck);

export default router;