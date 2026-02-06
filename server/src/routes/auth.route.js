import express from "express";
import {
  register,
  login,
  logout,
  refresh,
} from "../controllers/auth.controller.js";
import { registerLimiter, authLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
