import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authRole.middleware.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  addStock,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", authMiddleware, authorizeRole("admin"), createProduct);
router.put("/:id", authMiddleware, authorizeRole("admin"), updateProduct);
router.patch("/:id", authMiddleware, authorizeRole("admin"), addStock);

export default router;
