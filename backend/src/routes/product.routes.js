import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  addStock,
} from "../controllers/product.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authRole.middleware.js";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.get("/", rateLimiter(60, 60), getAllProducts);
router.get("/:id", rateLimiter(60, 60), getProductById);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  rateLimiter(10, 60),
  createProduct
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  rateLimiter(10, 60),
  updateProduct
);
router.patch(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  rateLimiter(10, 60),
  addStock
);

export default router;
