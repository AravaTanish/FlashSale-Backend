import redis from "../db/redis.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const globalRateLimiter = asyncHandler(async (req, res, next) => {
  const ip = req.ip;
  const key = `rate:global:${ip}`;

  const limit = 100;
  const ttl = 60;

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

export default globalRateLimiter;
