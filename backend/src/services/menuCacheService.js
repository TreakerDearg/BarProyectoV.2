/* =========================================================
   MENU CACHE SERVICE
   Caching layer for menu public endpoints
   Supports Redis (if configured) with in-memory fallback
========================================================= */

import { logger } from "../config/logger.js";

// In-memory cache fallback
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Redis client (will be initialized if configured)
let redisClient = null;
let redisAvailable = false;

/* =========================================================
   INITIALIZATION
========================================================= */
export const initCacheService = async () => {
  try {
    // Check if Redis is configured
    const redisUrl = process.env.REDIS_URL;
    
    if (redisUrl) {
      // Import redis only if configured
      const { createClient } = await import('redis');
      redisClient = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('[Cache] Redis reconnection failed after 10 retries');
              return new Error('Redis reconnection failed');
            }
            return retries * 100;
          }
        }
      });

      redisClient.on('error', (err) => {
        logger.error('[Cache] Redis Client Error:', err);
        redisAvailable = false;
      });

      redisClient.on('connect', () => {
        logger.info('[Cache] Redis connected successfully');
        redisAvailable = true;
      });

      await redisClient.connect();
    } else {
      logger.info('[Cache] Redis not configured, using in-memory cache');
    }
  } catch (error) {
    logger.error('[Cache] Failed to initialize Redis:', error);
    logger.info('[Cache] Falling back to in-memory cache');
  }
};

/* =========================================================
   CACHE OPERATIONS
========================================================= */

// Get cached value
export const get = async (key) => {
  try {
    if (redisAvailable && redisClient) {
      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      }
    } else {
      // Fallback to memory cache
      const cached = memoryCache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      } else if (cached) {
        memoryCache.delete(key);
      }
    }
    return null;
  } catch (error) {
    logger.error('[Cache] Error getting value:', error);
    return null;
  }
};

// Set cached value
export const set = async (key, value, ttl = CACHE_TTL) => {
  try {
    if (redisAvailable && redisClient) {
      await redisClient.setEx(key, ttl / 1000, JSON.stringify(value));
    } else {
      // Fallback to memory cache
      memoryCache.set(key, {
        data: value,
        timestamp: Date.now()
      });
    }
    return true;
  } catch (error) {
    logger.error('[Cache] Error setting value:', error);
    return false;
  }
};

// Delete cached value
export const del = async (key) => {
  try {
    if (redisAvailable && redisClient) {
      await redisClient.del(key);
    } else {
      memoryCache.delete(key);
    }
    return true;
  } catch (error) {
    logger.error('[Cache] Error deleting value:', error);
    return false;
  }
};

// Delete all keys matching pattern
export const delPattern = async (pattern) => {
  try {
    if (redisAvailable && redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      // For memory cache, delete all keys that start with pattern
      for (const key of memoryCache.keys()) {
        if (key.startsWith(pattern.replace('*', ''))) {
          memoryCache.delete(key);
        }
      }
    }
    return true;
  } catch (error) {
    logger.error('[Cache] Error deleting pattern:', error);
    return false;
  }
};

/* =========================================================
   MENU-SPECIFIC CACHE OPERATIONS
========================================================= */

// Cache key generators
export const cacheKeys = {
  publicMenu: (menuId) => `menu:public:${menuId}`,
  publicMenus: (filters) => `menu:public:list:${JSON.stringify(filters)}`,
  publicMenuBySlug: (slug) => `menu:public:slug:${slug}`,
  menuAvailability: (menuId) => `menu:availability:${menuId}`,
};

// Cache public menu
export const cachePublicMenu = async (menuId, menu) => {
  const key = cacheKeys.publicMenu(menuId);
  return await set(key, menu);
};

// Get cached public menu
export const getCachedPublicMenu = async (menuId) => {
  const key = cacheKeys.publicMenu(menuId);
  return await get(key);
};

// Cache public menus list
export const cachePublicMenus = async (filters, menus) => {
  const key = cacheKeys.publicMenus(filters);
  return await set(key, menus);
};

// Get cached public menus list
export const getCachedPublicMenus = async (filters) => {
  const key = cacheKeys.publicMenus(filters);
  return await get(key);
};

// Cache menu by slug
export const cacheMenuBySlug = async (slug, menu) => {
  const key = cacheKeys.publicMenuBySlug(slug);
  return await set(key, menu);
};

// Get cached menu by slug
export const getCachedMenuBySlug = async (slug) => {
  const key = cacheKeys.publicMenuBySlug(slug);
  return await get(key);
};

// Cache menu availability
export const cacheMenuAvailability = async (menuId, availability) => {
  const key = cacheKeys.menuAvailability(menuId);
  return await set(key, availability, CACHE_TTL / 2); // Shorter TTL for availability
};

// Get cached menu availability
export const getCachedMenuAvailability = async (menuId) => {
  const key = cacheKeys.menuAvailability(menuId);
  return await get(key);
};

// Invalidate all menu caches
export const invalidateMenuCache = async (menuId) => {
  try {
    // Invalidate specific menu caches
    await del(cacheKeys.publicMenu(menuId));
    await del(cacheKeys.menuAvailability(menuId));
    
    // Invalidate all list caches (since they might contain this menu)
    await delPattern('menu:public:list:*');
    
    logger.info(`[Cache] Invalidated cache for menu ${menuId}`);
    return true;
  } catch (error) {
    logger.error('[Cache] Error invalidating menu cache:', error);
    return false;
  }
};

// Invalidate all menu caches by slug
export const invalidateMenuCacheBySlug = async (slug) => {
  try {
    await del(cacheKeys.publicMenuBySlug(slug));
    await delPattern('menu:public:list:*');
    logger.info(`[Cache] Invalidated cache for menu slug ${slug}`);
    return true;
  } catch (error) {
    logger.error('[Cache] Error invalidating menu cache by slug:', error);
    return false;
  }
};

// Invalidate all menu caches (useful for bulk operations)
export const invalidateAllMenuCaches = async () => {
  try {
    await delPattern('menu:*');
    logger.info('[Cache] Invalidated all menu caches');
    return true;
  } catch (error) {
    logger.error('[Cache] Error invalidating all menu caches:', error);
    return false;
  }
};

/* =========================================================
   CLEANUP
========================================================= */
export const closeCacheService = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('[Cache] Redis connection closed');
    }
    memoryCache.clear();
  } catch (error) {
    logger.error('[Cache] Error closing cache service:', error);
  }
};
