/* =========================================================
   MIDDLEWARE CONFIGURATION SYSTEM
   Configuración centralizada para todos los middlewares
========================================================= */

import compressionMiddleware, {
  compressionWithLogging,
  getCompressionStats,
  resetCompressionStats
} from "./compression.js";
import {
  cacheMiddleware,
  cacheHeaders,
  purgeCache,
  noCache,
  getCacheStats as getCacheStatsFn,
  clearCache,
  cache
} from "./cache.js";
import {
  validateHeaders,
  validateContentType,
  requestId,
  validateUserAgent,
  validateOrigin,
  securityHeaders as headerSecurityHeaders,
  headers
} from "./validateHeaders.js";
import {
  createRateLimit as createRateLimitFn,
  adaptiveRateLimit,
  roleBasedRateLimit,
  ddosProtection,
  getRateLimitMetrics,
  resetRateLimit,
  rateLimiters
} from "./rateLimitEnhanced.js";
import {
  securityHeaders,
  productionSecurityHeaders,
  developmentSecurityHeaders,
  security
} from "./securityEnhanced.js";
import {
  bodyAnalysis,
  xssProtection,
  sqlInjectionProtection,
  getBodyAnalysisStats,
  bodyAnalysisMiddlewares
} from "./bodyAnalysis.js";
import {
  enhancedLogger,
  errorLogger,
  performanceLogger,
  enrichWithCustomContext,
  auditLogger,
  setLoggingLevel,
  getLoggingLevel,
  getLoggingStats,
  loggingMiddlewares
} from "./loggerEnhanced.js";
import {
  metricsMiddleware,
  healthCheckMiddleware,
  metricsEndpoint,
  prometheusMetricsEndpoint,
  alertingMiddleware,
  alertsEndpoint,
  resetMetricsEndpoint,
  getMetricsStore,
  getAlertingSystem,
  metricsMiddlewares
} from "./metrics.js";
import { errorHandler } from "./errorHandler.js";
import sanitize from "./sanitize.js";
import { validate, validateParams, validateQuery } from "./validate.js";
import { validateObjectId } from "./validateObjectId.js";
import { protect, authorizeRoles, authorizePermissions, optionalAuth } from "./auth.middleware.js";
import asyncHandler from "./asyncHandler.js";
import { createRateLimit } from "./rateLimitEnhanced.js";

/* =========================================================
   MIDDLEWARE CONFIGURATION PRESETS
========================================================= */
const middlewarePresets = {
  production: {
    logging: loggingMiddlewares.production,
    security: security.production,
    rateLimit: rateLimiters.api,
    compression: compressionWithLogging,
    cache: cache.api,
    headers: headers.api,
    bodyAnalysis: bodyAnalysisMiddlewares.moderate,
    metrics: metricsMiddlewares.full
  },
  
  development: {
    logging: loggingMiddlewares.development,
    security: security.development,
    rateLimit: rateLimiters.api, // Sin limitación estricta en dev
    compression: compressionWithLogging,
    cache: cache.none, // Desactivar caché en dev
    headers: headers.relaxed,
    bodyAnalysis: bodyAnalysisMiddlewares.lenient,
    metrics: metricsMiddlewares.full
  },
  
  testing: {
    logging: loggingMiddlewares.testing,
    security: security.basic,
    rateLimit: null, // Sin rate limiting en tests
    compression: null, // Sin compresión en tests
    cache: cache.none,
    headers: headers.relaxed,
    bodyAnalysis: null,
    metrics: metricsMiddlewares.minimal
  },
  
  minimal: {
    logging: loggingMiddlewares.minimal,
    security: security.basic,
    rateLimit: rateLimiters.api,
    compression: compressionMiddleware,
    cache: cache.none,
    headers: headers.relaxed,
    bodyAnalysis: null,
    metrics: null
  }
};

/* =========================================================
   CUSTOM MIDDLEWARE BUILDER
========================================================= */
export class MiddlewareBuilder {
  constructor(preset = 'production') {
    this.preset = middlewarePresets[preset] || middlewarePresets.production;
    this.customMiddlewares = [];
    this.options = {
      environment: process.env.NODE_ENV || 'production',
      enableLogging: true,
      enableSecurity: true,
      enableCompression: true,
      enableCache: true,
      enableMetrics: true
    };
  }
  
  static create(preset = 'production') {
    return new MiddlewareBuilder(preset);
  }
  
  setPreset(preset) {
    this.preset = middlewarePresets[preset] || this.preset;
    return this;
  }
  
  addMiddleware(middleware, position = 'end') {
    this.customMiddlewares.push({ middleware, position });
    return this;
  }
  
  removeMiddleware(middlewareName) {
    this.customMiddlewares = this.customMiddlewares.filter(m => m.middleware.name !== middlewareName);
    return this;
  }
  
  setOptions(options) {
    this.options = { ...this.options, ...options };
    return this;
  }
  
  enableLogging(enabled = true) {
    this.options.enableLogging = enabled;
    return this;
  }
  
  enableSecurity(enabled = true) {
    this.options.enableSecurity = enabled;
    return this;
  }
  
  enableCompression(enabled = true) {
    this.options.enableCompression = enabled;
    return this;
  }
  
  enableCache(enabled = true) {
    this.options.enableCache = enabled;
    return this;
  }
  
  enableMetrics(enabled = true) {
    this.options.enableMetrics = enabled;
    return this;
  }
  
  build() {
    const middlewares = [];
    
    // Security middleware (first)
    if (this.options.enableSecurity && this.preset.security) {
      middlewares.push(...this.preset.security);
    }
    
    // Rate limiting (second)
    if (this.preset.rateLimit) {
      middlewares.push(this.preset.rateLimit);
    }
    
    // Headers validation
    if (this.preset.headers) {
      middlewares.push(this.preset.headers);
    }
    
    // Body parser (built into Express)
    // Compression
    if (this.options.enableCompression && this.preset.compression) {
      middlewares.push(this.preset.compression);
    }
    
    // Logging
    if (this.options.enableLogging && this.preset.logging) {
      middlewares.push(this.preset.logging);
    }
    
    // Body analysis
    if (this.preset.bodyAnalysis) {
      middlewares.push(this.preset.bodyAnalysis);
    }
    
    // Metrics
    if (this.options.enableMetrics && this.preset.metrics) {
      middlewares.push(this.preset.metrics);
    }
    
    // Cache (last before routes)
    if (this.options.enableCache && this.preset.cache) {
      middlewares.push(this.preset.cache);
    }
    
    // Add custom middlewares at their positions
    const startMiddlewares = this.customMiddlewares.filter(m => m.position === 'start').map(m => m.middleware);
    const endMiddlewares = this.customMiddlewares.filter(m => m.position === 'end').map(m => m.middleware);
    
    return [...startMiddlewares, ...middlewares, ...endMiddlewares];
  }
}

/* =========================================================
   ROUTE-SPECIFIC MIDDLEWARE CONFIGURATIONS
========================================================= */
export const routeMiddlewareConfigs = {
  // Authentication routes
  auth: [
    rateLimiters.auth,
    bodyAnalysisMiddlewares.moderate,
    headers.api
  ],
  
  // Public routes
  public: [
    rateLimiters.public,
    security.basic,
    headers.relaxed
  ],
  
  // Admin routes
  admin: [
    protect,
    authorizeRoles('admin'),
    bodyAnalysisMiddlewares.strict,
    loggingMiddlewares.production
  ],
  
  // API routes
  api: [
    protect,
    rateLimiters.api,
    security.production,
    bodyAnalysisMiddlewares.moderate,
    headers.api
  ],
  
  // Order routes (critical)
  orders: [
    protect,
    rateLimiters.orders,
    bodyAnalysisMiddlewares.strict,
    metricsMiddlewares.full
  ],
  
  // Dashboard routes
  dashboard: [
    protect,
    authorizeRoles('admin', 'manager'),
    rateLimiters.dashboard,
    cache.dashboard
  ],
  
  // File upload routes
  upload: [
    protect,
    authorizeRoles('admin', 'manager'),
    rateLimiters.api,
    bodyAnalysisMiddlewares.strict
  ],
  
  // WebSocket routes
  websocket: [
    protect,
    security.basic
  ]
};

/* =========================================================
   MIDDLEWARE CHAIN BUILDER
======================================================== */
export const buildMiddlewareChain = (config) => {
  const chain = [];
  
  if (Array.isArray(config)) {
    return config;
  }
  
  if (typeof config === 'string') {
    return routeMiddlewareConfigs[config] || [];
  }
  
  if (config.middleware) {
    chain.push(...config.middleware);
  }
  
  if (config.auth) {
    chain.push(protect);
    if (config.roles) {
      chain.push(authorizeRoles(...config.roles));
    }
    if (config.permissions) {
      chain.push(authorizePermissions(...config.permissions));
    }
  }
  
  if (config.validation) {
    chain.push(validate(config.validation));
  }
  
  if (config.sanitize) {
    chain.push(sanitize);
  }
  
  if (config.rateLimit) {
    chain.push(rateLimiters[config.rateLimit] || rateLimiters.api);
  }
  
  if (config.cache) {
    chain.push(cache[config.cache] || cache.api);
  }
  
  return chain;
};

/* =========================================================
   MIDDLEWARE COMPOSER
======================================================== */
export const composeMiddleware = (...middlewares) => {
  return (req, res, next) => {
    let index = 0;
    
    const dispatch = (i) => {
      if (i >= middlewares.length) {
        return next();
      }
      
      const middleware = middlewares[i];
      
      if (typeof middleware === 'function') {
        return middleware(req, res, (err) => {
          if (err) return next(err);
          dispatch(i + 1);
        });
      }
      
      dispatch(i + 1);
    };
    
    dispatch(0);
  };
};

/* =========================================================
   CONDITIONAL MIDDLEWARE
========================================================= */
export const conditionalMiddleware = (condition, middleware) => {
  return (req, res, next) => {
    if (condition(req)) {
      return middleware(req, res, next);
    }
    next();
  };
};

/* =========================================================
   ENVIRONMENT-AWARE MIDDLEWARE
======================================================== */
export const envMiddleware = (middlewares) => {
  return (req, res, next) => {
    const env = process.env.NODE_ENV || 'production';
    const middleware = middlewares[env] || middlewares.production || middlewares.default;
    
    if (middleware) {
      return middleware(req, res, next);
    }
    
    next();
  };
};

/* =========================================================
   MIDDLEWARE DECORATOR
======================================================== */
export const withMiddleware = (middleware) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args) {
      const req = args[0];
      const res = args[1];
      const next = args[2];
      
      return new Promise((resolve, reject) => {
        middleware(req, res, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          Promise.resolve(originalMethod.apply(this, args))
            .then(resolve)
            .catch(reject);
        });
      });
    };
    
    return descriptor;
  };
};

/* =========================================================
   GET MIDDLEWARE PRESET
======================================================== */
export const getMiddlewarePreset = (preset) => {
  return middlewarePresets[preset] || middlewarePresets.production;
};

/* =========================================================
   CUSTOM PRESET REGISTRATION
======================================================== */
export const registerCustomPreset = (name, preset) => {
  middlewarePresets[name] = preset;
  return middlewarePresets[name];
};

/* =========================================================
   EXPORT ALL MIDDLEWARES
======================================================== */
export const middleware = {
  // Individual middlewares
  compression: compressionMiddleware,
  cache,
  headers,
  rateLimit: rateLimiters,
  security,
  bodyAnalysis,
  logging: loggingMiddlewares,
  metrics: metricsMiddlewares,
  
  // Auth middlewares
  auth: {
    protect,
    authorizeRoles,
    authorizePermissions,
    optionalAuth
  },
  
  // Validation middlewares
  validate,
  validateParams,
  validateQuery,
  validateObjectId,
  sanitize,
  
  // Error handling
  errorHandler,
  asyncHandler,
  
  // Configuration
  presets: middlewarePresets,
  routeConfigs: routeMiddlewareConfigs,
  
  // Builders
  builder: MiddlewareBuilder,
  buildChain: buildMiddlewareChain,
  compose: composeMiddleware,
  conditional: conditionalMiddleware,
  env: envMiddleware,
  with: withMiddleware,
  registerPreset: registerCustomPreset,
  getPreset: getMiddlewarePreset
};

export default middleware;