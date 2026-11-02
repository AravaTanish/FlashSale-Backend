import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Product from "../models/Product.model.js";
import { getCache, setCache, deleteCache } from "../utils/cache.js";
import {
  ALL_PRODUCTS_CACHE_KEY,
  ALL_PRODUCTS_TTL,
  SINGLE_PRODUCT_TTL,
} from "../constants/redisKeys.js";

export const getAllProducts = asyncHandler(async (req, res) => {
  let cachedProducts = null;

  try {
    cachedProducts = await getCache(ALL_PRODUCTS_CACHE_KEY);
  } catch (error) {
    console.error("Redis cache read failed:", error.message);
  }

  if (cachedProducts !== null) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Products retrieved successfully", cachedProducts)
      );
  }

  const products = await Product.find().select("-stock");

  try {
    await setCache(ALL_PRODUCTS_CACHE_KEY, products, ALL_PRODUCTS_TTL);
  } catch (error) {
    console.error("Redis cache write failed:", error.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Products retrieved successfully", products));
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `product:${id}`;
  let cachedProduct = null;

  try {
    cachedProduct = await getCache(cacheKey);
  } catch (error) {
    console.error("Redis cache read failed:", error.message);
  }

  if (cachedProduct !== null) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Product retrieved successfully", cachedProduct)
      );
  }

  const product = await Product.findById(id).select("-stock");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  try {
    await setCache(cacheKey, product, SINGLE_PRODUCT_TTL);
  } catch (error) {
    console.error("Redis cache write failed:", error.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product retrieved successfully", product));
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock } = req.body;

  if (
    name === undefined ||
    price === undefined ||
    stock === undefined ||
    description === undefined
  ) {
    throw new ApiError(
      400,
      "Name, price, stock, and description are required fields"
    );
  }

  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    name.trim() === "" ||
    description.trim() === "" ||
    !Number.isInteger(price) ||
    !Number.isInteger(stock) ||
    price <= 0 ||
    stock < 0
  ) {
    throw new ApiError(400, "Invalid product details");
  }

  const product = await Product.create({
    name: name.trim(),
    description: description.trim(),
    price,
    stock,
  });

  try {
    await deleteCache(ALL_PRODUCTS_CACHE_KEY);
  } catch (error) {
    console.error("Redis cache delete failed:", error.message);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Product created successfully", product));
});

export const addStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  if (!Number.isInteger(stock) || stock <= 0) {
    throw new ApiError(400, "Stock must be a positive integer");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  product.stock += stock;
  if (product.stock > 0) {
    product.inStock = true;
  }
  await product.save();

  try {
    await deleteCache(`product:${product._id.toString()}`);
  } catch (error) {
    console.error("Redis cache delete failed:", error.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product stock updated successfully", product));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new ApiError(400, "Invalid product name");
    }

    product.name = name.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.trim() === "") {
      throw new ApiError(400, "Invalid product description");
    }

    product.description = description.trim();
  }

  if (price !== undefined) {
    if (!Number.isInteger(price) || price <= 0) {
      throw new ApiError(400, "Invalid product price");
    }
    product.price = price;
  }
  await product.save();

  try {
    await deleteCache(`product:${product._id.toString()}`);
  } catch (error) {
    console.error("Redis cache delete failed:", error.message);
  }
  try {
    await deleteCache(ALL_PRODUCTS_CACHE_KEY);
  } catch (error) {
    console.error("Redis cache delete failed:", error.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product updated successfully", product));
});
