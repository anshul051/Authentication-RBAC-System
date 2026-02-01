import express from 'express';
import { getProfile, updateProfile } from '../controller/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * All Routes in this file are protected and require authentication
 * We apply the 'authenticate' middleware to all routes defined below
 */
router.use(authenticate);

router.get('/profile', getProfile);

router.put('/profile', updateProfile);

export default router;