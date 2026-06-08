/* =========================================================
   REDIS CACHING UTILITIES
========================================================= */
import Redis from 'ioredis';

let redisClient = null;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  return redisClient;
};

export const cacheGet = async (key) => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (key, value, ttl = 3600) => {
  try {
    const client = getRedisClient();
    await client.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

export const cacheDel = async (key) => {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

export const cacheDelPattern = async (pattern) => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Cache delete pattern error:', error);
    return false;
  }
};

export const cacheFlush = async () => {
  try {
    const client = getRedisClient();
    await client.flushdb();
    return true;
  } catch (error) {
    console.error('Cache flush error:', error);
    return false;
  }
};

// Menu-specific cache helpers
export const cacheMenu = async (menuId, menu, ttl = 3600) => {
  return cacheSet(`menu:${menuId}`, menu, ttl);
};

export const getCachedMenu = async (menuId) => {
  return cacheGet(`menu:${menuId}`);
};

export const invalidateMenuCache = async (menuId) => {
  await cacheDel(`menu:${menuId}`);
  await cacheDelPattern(`menus:*`);
};

export const cachePublicMenus = async (menus, ttl = 1800) => {
  return cacheSet(`menus:public`, menus, ttl);
};

export const getCachedPublicMenus = async () => {
  return cacheGet(`menus:public`);
};

export const invalidatePublicMenusCache = async () => {
  await cacheDel(`menus:public`);
};
