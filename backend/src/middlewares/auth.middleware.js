import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }

    if (err.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token");
    }

    throw new ApiError(401, "Authentication failed");
  }
};

export default authMiddleware;
