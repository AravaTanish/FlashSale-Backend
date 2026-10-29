import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refresh,
  me,
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
//import authorizeRole from "../middlewares/authRole.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, me);

export default router;
