import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} from "../controllers/order.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, rateLimiter(10, 60), createOrder);
router.get("/my-orders", authMiddleware, rateLimiter(30, 60), getMyOrders);
router.get("/:id", authMiddleware, rateLimiter(30, 60), getOrderById);
router.post("/:id", authMiddleware, rateLimiter(5, 60), cancelOrder);

export default router;
