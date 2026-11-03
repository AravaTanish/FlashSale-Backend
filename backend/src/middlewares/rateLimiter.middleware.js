import redis from "../db/redis.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const rateLimiter = (limit, ttl) => {
  return asyncHandler(async (req, res, next) => {
    const ip = req.ip;
    const key = `rate:route:${req.method}:${req.baseUrl}${req.path}:${ip}`;

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, ttl);
    }

    if (current > limit) {
      const remainingTime = await redis.ttl(key);
      res.set("Retry-After", String(Math.max(remainingTime, 1)));
      throw new ApiError(429, "Too many requests");
    }

    next();
  });
};

export default rateLimiter;
