import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refresh,
  me,
} from "../controllers/user.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.post("/register", rateLimiter(5, 10 * 60), registerUser);
router.post("/login", rateLimiter(10, 10 * 60), loginUser);
router.post("/logout", rateLimiter(10, 60), authMiddleware, logoutUser);
router.post("/refresh", rateLimiter(10, 10 * 60), refresh);
router.get("/me", rateLimiter(30, 60), authMiddleware, me);

export default router;
