import express from "express";
import { getProfile, updateProfile, getAllUsers, unlockUserAccount, triggerTokenCleanup } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";
import { validateUpdateProfile } from '../middleware/validate.middleware.js';

const router = express.Router();

/**
 * All Routes in this file are protected and require authentication
 * We apply the 'authenticate' middleware to all routes defined below
 */
router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", validateUpdateProfile, updateProfile);

// Admin-only route
router.get("/all", authorize("admin"), getAllUsers);
router.post('/unlock/:userId', authorize('admin'), unlockUserAccount);
router.post('/cleanup-tokens', authorize('admin'), triggerTokenCleanup);
export default router;