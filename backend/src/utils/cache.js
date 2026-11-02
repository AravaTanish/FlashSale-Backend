import redis from "../db/redis.js";

export const getCache = async (key) => {
  const cachedData = await redis.get(key);
  if (cachedData === null) {
    return null;
  }
  return JSON.parse(cachedData);
};

export const setCache = async (key, value, ttl = 60) => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const deleteCache = async (key) => {
  await redis.del(key);
};
