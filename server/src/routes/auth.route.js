import express from "express";
import {register,login, logout,refresh,} from "../controllers/auth.controller.js";
import { registerLimiter, authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", authLimiter, login);

router.post("/register", register);
router.post("/login", login);

router.post("/logout", logout);
// Refresh token route does not require rate limiting as it is used to obtain a new access token when the current one expires.
router.post("/refresh", refresh);

export default router;