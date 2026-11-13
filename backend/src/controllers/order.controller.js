import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Product from "../models/Product.model.js";
import Order from "../models/Order.model.js";
import { deleteCache } from "../utils/cache.js";
import { ALL_PRODUCTS_CACHE_KEY } from "../constants/redisKeys.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Order must contain at least one item");
  }

  for (const item of items) {
    if (!item.product || !item.quantity) {
      throw new ApiError(
        400,
        "Each order item must contain product and quantity"
      );
    }
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new ApiError(400, "Quantity must be a positive safe integer");
    }
  }

  const allProductsMap = new Map();
  for (const item of items) {
    const productId = item.product.toString();
    const newQuantity = (allProductsMap.get(productId) || 0) + item.quantity;
    if (!Number.isSafeInteger(newQuantity)) {
      throw new ApiError(400, "Quantity is too large");
    }
    allProductsMap.set(productId, newQuantity);
  }

  const productIds = Array.from(allProductsMap.keys());
  const productsToDeleteCache = new Set();
  let order;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const products = await Product.find({
        _id: { $in: productIds },
      }).session(session);

      if (products.length !== productIds.length) {
        throw new ApiError(404, "One or more products were not found");
      }

      const productMap = new Map();
      for (const product of products) {
        productMap.set(product._id.toString(), product);
      }

      let totalAmount = 0;
      const orderItems = [];

      for (const [productId, quantity] of allProductsMap) {
        const product = productMap.get(productId);

        if (!product) {
          throw new ApiError(404, `Product ${productId} not found`);
        }

        const itemTotal = product.price * quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product: product._id,
          quantity: quantity,
          price: product.price,
        });
      }

      for (const [productId, quantity] of allProductsMap) {
        const product = productMap.get(productId);
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: product._id,
            stock: { $gte: quantity },
          },
          {
            $inc: { stock: -quantity },
          },
          {
            returnDocument: "after",
            session,
          }
        );

        if (!updatedProduct) {
          throw new ApiError(
            400,
            `Insufficient stock for product "${product.name}"`
          );
        }

        if (updatedProduct.stock === 0) {
          await Product.updateOne(
            { _id: product._id },
            { $set: { inStock: false } },
            { session }
          );
          productsToDeleteCache.add(product._id.toString());
        }
      }
      order = new Order({
        user: req.user.id,
        items: orderItems,
        totalAmount,
        status: "pending",
      });
      order = await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  if (productsToDeleteCache.size > 0) {
    for (const productId of productsToDeleteCache) {
      try {
        await deleteCache(`product:${productId}`);
      } catch (error) {
        console.error("Redis cache delete failed:", error.message);
      }
    }
    try {
      await deleteCache(ALL_PRODUCTS_CACHE_KEY);
    } catch (error) {
      console.error("Redis cache delete failed:", error.message);
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Order placed successfully", order));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user.id,
  })
    .populate("items.product", "name price")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Orders retrieved successfully", orders));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
    user: req.user.id,
  }).populate("items.product", "name price");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Order retrieved successfully", order));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      order = await Order.findOneAndUpdate(
        {
          _id: id,
          user: req.user.id,
          status: "pending",
        },
        {
          $set: { status: "cancelled" },
        },
        {
          returnDocument: "after",
          session,
        }
      );

      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      for (const item of order.items) {
        const updatedProduct = await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: { stock: item.quantity },
            $set: { inStock: true },
          },
          {
            returnDocument: "after",
            session,
          }
        );
        if (!updatedProduct) {
          throw new ApiError(404, "Product not found while cancelling order");
        }
      }
    });
  } finally {
    await session.endSession();
  }

  for (const item of order.items) {
    try {
      await deleteCache(`product:${item.product}`);
    } catch (error) {
      console.error("Redis cache delete failed:", error.message);
    }
  }

  try {
    await deleteCache(ALL_PRODUCTS_CACHE_KEY);
  } catch (error) {
    console.error("Redis cache delete failed:", error.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Order cancelled successfully", order));
});
