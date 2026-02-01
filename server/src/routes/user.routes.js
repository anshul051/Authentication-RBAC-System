import express from 'express';
import { getProfile, updateProfile } from '../controller/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { getAllUsers } from '../controller/user.controller.js';

const router = express.Router();

/**
 * All Routes in this file are protected and require authentication
 * We apply the 'authenticate' middleware to all routes defined below
 */
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin-only route
router.get('/all', authorize('admin'), getAllUsers);


export default router;