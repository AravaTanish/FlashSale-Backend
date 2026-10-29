import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Product from "../models/Product.model.js";

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();

  return res
    .status(200)
    .json(new ApiResponse(200, "Products retrieved successfully", products));
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
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
    description,
    price,
    stock,
  });

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
  console.log(`Updated stock for product ${product.name}: ${product.stock}`);

  await product.save();

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
    if (typeof description !== "string") {
      throw new ApiError(400, "Invalid product description");
    }

    product.description = description;
  }

  if (price !== undefined) {
    if (!Number.isInteger(price) || price <= 0) {
      throw new ApiError(400, "Invalid product price");
    }

    product.price = price;
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Product updated successfully", product));
});
