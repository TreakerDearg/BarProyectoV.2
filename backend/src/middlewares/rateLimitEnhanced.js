import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { logger } from "../config/logger.js";

/* =========================================================
   ADVANCED RATE LIMITING MIDDLEWARE
   Sistema mejorado de rate limiting con múltiples estrategias
========================================================= */

/* =========================================================
   RATE LIMIT STORE WITH METRICS
========================================================= */
class EnhancedRateLimitStore {
  constructor() {
    this.clients = new Map();
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      allowedRequests: 0,
      resetCount: 0,
      violations: {}
    };
  }
  
  increment(key) {
    const now = Date.now();
    const client = this.clients.get(key);
    
    if (!client) {
      this.clients.set(key, {
        count: 1,
        resetTime: now + 60000, // 1 minute
        firstRequest: now,
        violations: 0
      });
      this.metrics.totalRequests++;
      this.metrics.allowedRequests++;
      return { count: 1, resetTime: now + 60000, allowed: true };
    }
    
    // Check if window has expired
    if (now > client.resetTime) {
      this.metrics.resetCount++;
      this.clients.set(key, {
        count: 1,
        resetTime: now + 60000,
        firstRequest: now,
        violations: client.violations
      });
      this.metrics.totalRequests++;
      this.metrics.allowedRequests++;
      return { count: 1, resetTime: now + 60000, allowed: true };
    }
    
    client.count++;
    this.metrics.totalRequests++;
    
    return {
      count: client.count,
      resetTime: client.resetTime,
      allowed: true,
      violations: client.violations
    };
  }
  
  block(key, duration) {
    const client = this.clients.get(key);
    if (client) {
      client.violations++;
      client.resetTime = Date.now() + duration;
      client.count = 0;
    }
    
    this.metrics.blockedRequests++;
    
    // Track violations by key pattern
    const keyPattern = key.split(':')[0]; // Extract IP or user ID
    this.metrics.violations[keyPattern] = (this.metrics.violations[keyPattern] || 0) + 1;
  }
  
  reset(key) {
    if (key) {
      this.clients.delete(key);
    } else {
      this.clients.clear();
    }
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      activeClients: this.clients.size,
      violationRate: this.metrics.totalRequests > 0 
        ? `${((this.metrics.blockedRequests / this.metrics.totalRequests) * 100).toFixed(2)}%`
        : '0%',
      topViolations: Object.entries(this.metrics.violations)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
    };
  }
}

const store = new EnhancedRateLimitStore();

/* =========================================================
   RATE LIMIT CONFIGURATION
========================================================= */
const rateLimitConfigs = {
  // API General
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 120, // 120 requests por ventana
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Demasiadas solicitudes a la API general",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: 900 // 15 minutos
    }
  },
  
  // Auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 intentos de auth
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Demasiados intentos de autenticación",
      code: "AUTH_RATE_LIMIT",
      retryAfter: 900
    }
  },
  
  // Order creation
  orders: {
    windowMs: 60 * 1000, // 1 minuto
    max: 20, // 20 pedidos por minuto
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Estás enviando demasiados pedidos. Intenta más lento.",
      code: "ORDER_RATE_LIMIT",
      retryAfter: 60
    }
  },
  
  // Roulette game
  roulette: {
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 giros por minuto
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Demasiados giros de ruleta. Espera un momento.",
      code: "ROULETTE_RATE_LIMIT",
      retryAfter: 60
    }
  },
  
  // Dashboard analytics
  dashboard: {
    windowMs: 60 * 1000, // 1 minuto
    max: 60, // 60 requests por minuto
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Demasiadas solicitudes al dashboard",
      code: "DASHBOARD_RATE_LIMIT",
      retryAfter: 60
    }
  },
  
  // Public endpoints
  public: {
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // 100 requests por minuto
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Demasiadas solicitudes desde IP pública",
      code: "PUBLIC_RATE_LIMIT",
      retryAfter: 60
    }
  }
};

/* =========================================================
   CUSTOM KEY GENERATOR (IPv6-safe)
========================================================= */
const keyGenerator = (req) => {
  // Prioridad: User ID > IP > Session ID
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  
  if (req.sessionID) {
    return `session:${req.sessionID}`;
  }
  
  // Use the IP helper function from express-rate-limit for proper IPv6 handling
  return ipKeyGenerator(req);
};

/* =========================================================
   CUSTOM SKIP FUNCTION
======================================================== */
const skipFunction = (req) => {
  // Skip rate limiting for trusted users
  if (req.user?.role === 'admin' || req.user?.role === 'manager') {
    return true;
  }
  
  // Skip for specific routes (if needed)
  const skipRoutes = ['/health', '/'];
  if (skipRoutes.includes(req.path)) {
    return true;
  }
  
  return false;
};

/* =========================================================
   CUSTOM HANDLER
========================================================= */
const handler = (req, res, next, options) => {
  logger.warn('[Rate Limit] Límite excedido', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    userAgent: req.headers['user-agent']?.substring(0, 100)
  });
  
  res.status(options.statusCode || 429).json(options.message);
};

/* =========================================================
   CREATE RATE LIMIT MIDDLEWARE
========================================================= */
export const createRateLimit = (configName = 'api', customOptions = {}) => {
  const baseConfig = rateLimitConfigs[configName] || rateLimitConfigs.api;
  const config = { ...baseConfig, ...customOptions };
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    skip: skipFunction,
    keyGenerator: keyGenerator,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    handler: (req, res) => handler(req, res, null, config),
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests
  });
};

/* =========================================================
   ADAPTIVE RATE LIMITING
========================================================= */
export const adaptiveRateLimit = (options = {}) => {
  const {
    baseMax = 100,
    baseWindowMs = 60000,
    multiplier = 1.5,
    maxMultiplier = 3,
    trustThreshold = 10 // consecutive successful requests
  } = options;
  
  const trustScores = new Map();
  
  const limiter = rateLimit({
    windowMs: baseWindowMs,
    max: (req) => {
      const key = keyGenerator(req);
      const trustScore = trustScores.get(key) || 0;
      
      // Calculate dynamic limit based on trust
      const multiplier = Math.min(Math.pow(1.1, trustScore), maxMultiplier);
      const dynamicMax = Math.floor(baseMax * multiplier);
      
      logger.debug('[Adaptive Rate Limit] Dynamic limit', {
        key,
        trustScore,
        multiplier: multiplier.toFixed(2),
        dynamicMax,
        baseMax
      });
      
      return dynamicMax;
    },
    keyGenerator: keyGenerator,
    skip: skipFunction,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const key = keyGenerator(req);
      // Decrease trust score on rate limit
      trustScores.set(key, Math.max(0, (trustScores.get(key) || 0) - 2));
      
      res.status(429).json({
        success: false,
        message: "Rate limit exceeded",
        code: "ADAPTIVE_RATE_LIMIT",
        retryAfter: Math.floor(baseWindowMs / 1000)
      });
    }
  });
  
  // Wrapper middleware to track successful requests and increase trust
  const adaptiveWrapper = (req, res, next) => {
    const key = keyGenerator(req);
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode < 400) {
        // Increase trust score on successful response
        const currentScore = trustScores.get(key) || 0;
        trustScores.set(key, Math.min(trustThreshold, currentScore + 0.5));
      }
      return originalSend.call(this, data);
    };
    
    next();
  };
  
  // Return both limiter and wrapper as an array
  return [adaptiveWrapper, limiter];
};

/* =========================================================
   ROLE-BASED RATE LIMITING
========================================================= */
export const roleBasedRateLimit = (options = {}) => {
  const {
    limits = {
      admin: { max: 1000, windowMs: 60000 },
      manager: { max: 500, windowMs: 60000 },
      bartender: { max: 200, windowMs: 60000 },
      kitchen: { max: 200, windowMs: 60000 },
      default: { max: 100, windowMs: 60000 }
    }
  } = options;
  
  // Use the default windowMs for all roles (required for MemoryStore)
  const defaultWindowMs = limits.default.windowMs;
  
  return rateLimit({
    windowMs: defaultWindowMs,
    max: (req) => {
      const userRole = req.user?.role || 'default';
      return limits[userRole]?.max || limits.default.max;
    },
    keyGenerator: keyGenerator,
    skip: (req) => req.user?.role === 'admin', // Skip entirely for admins
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const userRole = req.user?.role || 'default';
      const limit = limits[userRole] || limits.default;
      
      res.status(429).json({
        success: false,
        message: "Rate limit exceeded for your role",
        code: "ROLE_RATE_LIMIT",
        role: userRole,
        limit: limit.max,
        retryAfter: Math.floor(defaultWindowMs / 1000)
      });
    }
  });
};

/* =========================================================
   DDoS PROTECTION RATE LIMIT
======================================================== */
export const ddosProtection = (options = {}) => {
  const {
    burstLimit = 50,
    sustainedLimit = 100,
    burstWindowMs = 1000, // 1 second
    sustainedWindowMs = 60000 // 1 minute
  } = options;
  
  const burstLimiter = rateLimit({
    windowMs: burstWindowMs,
    max: burstLimit,
    keyGenerator: (req) => `burst:${ipKeyGenerator(req)}`,
    skip: skipFunction,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('[DDoS Protection] Burst limit exceeded', {
        ip: req.ip,
        path: req.path,
        userAgent: req.headers['user-agent']
      });
      res.status(429).json({
        success: false,
        message: "DDoS protection activated",
        code: "DDOS_BURST_LIMIT",
        retryAfter: Math.floor(burstWindowMs / 1000)
      });
    }
  });
  
  const sustainedLimiter = rateLimit({
    windowMs: sustainedWindowMs,
    max: sustainedLimit,
    keyGenerator: (req) => `sustained:${ipKeyGenerator(req)}`,
    skip: skipFunction,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('[DDoS Protection] Sustained limit exceeded', {
        ip: req.ip,
        path: req.path
      });
      res.status(429).json({
        success: false,
        message: "Rate limit exceeded",
        code: "DDOS_SUSTAINED_LIMIT",
        retryAfter: Math.floor(sustainedWindowMs / 1000)
      });
    }
  });
  
  return [burstLimiter, sustainedLimiter];
};

/* =========================================================
   GET RATE LIMIT METRICS
======================================================== */
export const getRateLimitMetrics = () => {
  return store.getMetrics();
};

/* =========================================================
   RESET RATE LIMIT FOR KEY
========================================================= */
export const resetRateLimit = (key) => {
  store.reset(key);
};

/* =========================================================
   PRECONFIGURED RATE LIMITERS
========================================================= */
// Note: adaptive and ddos return arrays of middlewares
export const rateLimiters = {
  api: createRateLimit('api'),
  auth: createRateLimit('auth'),
  orders: createRateLimit('orders'),
  roulette: createRateLimit('roulette'),
  dashboard: createRateLimit('dashboard'),
  public: createRateLimit('public'),
  adaptive: adaptiveRateLimit(),
  roleBased: roleBasedRateLimit(),
  ddos: ddosProtection()
};

// Export individual rate limiters for backward compatibility
export const apiLimiter = rateLimiters.api;
export const authLimiter = rateLimiters.auth;
export const orderLimiter = rateLimiters.orders;

export default {
  createRateLimit,
  rateLimiters,
  adaptiveRateLimit,
  roleBasedRateLimit,
  ddosProtection,
  getRateLimitMetrics,
  resetRateLimit,
  apiLimiter,
  authLimiter,
  orderLimiter
};