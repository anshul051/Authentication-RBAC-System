import express from "express";
import {register,login, logout,refresh,} from "../controllers/auth.controller.js";
import { registerLimiter, authLimiter } from "../middleware/rateLimiter.middleware.js";
import { validateRegister, validateLogin } from '../middleware/validate.middleware.js';

const router = express.Router();

/**
 * Middleware order matters!!
 * Rate Limiter -> Validation -> Controller
 */

router.post("/register", registerLimiter,validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);

router.post("/logout", logout);
// Refresh token route does not require rate limiting as it is used to obtain a new access token when the current one expires.
router.post("/refresh", refresh);

export default router;