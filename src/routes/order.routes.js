import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authRole.middleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.post("/:id", authMiddleware, cancelOrder);

export default router;
