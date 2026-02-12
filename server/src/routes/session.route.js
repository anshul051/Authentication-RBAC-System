import express from 'express';
import { getActiveSessions, revokeSession, revokeAllSessions } from '../controllers/session.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes requires authentication
router.use(authenticate);

/**
 * Get active sessions for current user
 * @route GET /api/sessions
 * @access Private
 */
router.get('/', getActiveSessions);

/**
 * Logout from specific session
 * @router DELETE /api/sessions/:tokenId
 * @access Private
 */
router.delete('/:tokenId', revokeSession);

/**
 * Logout from all sessions except current
 * @route DELETE /api/sessions
 * @access Private
 */
router.post('/revoke-all', revokeAllSessions);

export default router;