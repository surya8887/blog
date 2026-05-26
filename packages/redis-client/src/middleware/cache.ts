import { Request, Response, NextFunction } from "express";
import { redis } from "../index.js";

/**
 * Cache middleware for Express routes.
 * Caches the response JSON using the request URL as the key.
 * @param ttl Time to live in seconds
 */
export const cacheMiddleware = (ttl: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Build cache key from request URL (e.g. /api/v1/posts?page=1)
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        console.log(`[Redis] Cache hit for ${key}`);
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        
        // @upstash/redis automatically parses JSON responses
        const data = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        return res.status(200).json(data);
      }

      console.log(`[Redis] Cache miss for ${key}`);
      res.setHeader("X-Cache", "MISS");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

      // Intercept the res.json method to capture the output
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Cache the response body
        redis.set(key, body, { ex: ttl }).catch((err) => {
          console.error("[Redis] Failed to set cache:", err);
        });

        // Call original res.json
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("[Redis] Cache middleware error:", error);
      next(); // Fail gracefully and proceed without caching
    }
  };
};

/**
 * Clear all cache keys matching a pattern.
 * @param pattern The key pattern to match (e.g., 'cache:/api/v1/posts*')
 */
export const clearCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Redis] Cleared ${keys.length} cached entries for pattern: ${pattern}`);
    }
  } catch (error) {
    console.error("[Redis] Failed to clear cache:", error);
  }
};
