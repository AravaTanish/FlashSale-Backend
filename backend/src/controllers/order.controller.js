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

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new ApiError(400, "Quantity must be a positive integer");
    }
  }

  const productIds = items.map((item) => item.product);

  const products = await Product.find({
    _id: { $in: productIds },
  });

  if (products.length !== items.length) {
    throw new ApiError(404, "One or more products were not found");
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find(
      (product) => product._id.toString() === item.product.toString()
    );

    if (!product) {
      throw new ApiError(404, `Product ${item.product} not found`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for product "${product.name}". Available stock: ${product.stock}`
      );
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const productsToDeleteCache = [];

  for (const item of items) {
    const product = products.find(
      (product) => product._id.toString() === item.product.toString()
    );

    const previousStock = product.stock;
    product.stock -= item.quantity;

    if (previousStock > 0 && product.stock === 0) {
      product.inStock = false;
      productsToDeleteCache.push(product._id.toString());
    }

    await product.save();
  }

  if (productsToDeleteCache.length > 0) {
    for(const productId of productsToDeleteCache) {
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

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalAmount,
    status: "pending",
  });

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

  const order = await Order.findOne({
    _id: id,
    user: req.user.id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "pending") {
    throw new ApiError(400, "Only pending orders can be cancelled");
  }

  order.status = "cancelled";
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Order cancelled successfully", order));
});
