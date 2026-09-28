import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const user = await User.findOne({ email });
  if (user) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await hashPassword(password);
  await User.create({ name, email, password: hashedPassword });

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(user.password, password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const session = await Session.create({
    user: user._id,
    refreshTokenHash: "temporaryHash",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role, session._id);

  const hashedRefreshToken = await hashPassword(refreshToken);
  session.refreshTokenHash = hashedRefreshToken;
  await session.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 20 * 60 * 1000,
  });

  return res.status(200).json(new ApiResponse(200, "Login successful"));
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User data retrieved successfully", user));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const session = await Session.findById(decoded.sessionId);
  if (!session) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  if (session.expiresAt < new Date()) {
    await Session.deleteOne({ _id: session._id });
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  if (!(await verifyPassword(session.refreshTokenHash, refreshToken))) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const accessToken = generateAccessToken(decoded.id, decoded.role);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 20 * 60 * 1000,
  });
  return res.status(200).json(new ApiResponse(200, "Access token refreshed"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const session = await Session.findById(decoded.sessionId);
  if (!session) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  if (!(await verifyPassword(session.refreshTokenHash, refreshToken))) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  await Session.deleteOne({ _id: decoded.sessionId });
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});
