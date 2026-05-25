/* =========================================================
   ENHANCED LOGGING MIDDLEWARE
   Sistema de logging mejorado con contexto estructurado
========================================================= */

import { logger } from "../config/logger.js";
import crypto from "crypto";

/* =========================================================
   LOGGING CONFIGURATION
========================================================= */
const loggingConfig = {
  // Request logging
  logRequests: true,
  logResponseTime: true,
  logRequestBody: false,
  logResponseBody: false,
  logHeaders: false,
  
  // Performance tracking
  trackSlowRequests: true,
  slowRequestThreshold: 1000, // ms
  
  // Error tracking
  logErrors: true,
  logStackTraces: true,
  
  // Context enrichment
  enrichWithUser: true,
  enrichWithIp: true,
  enrichWithUserAgent: true,
  
  // Sensitive data filtering
  filterSensitiveData: true,
  sensitiveFields: ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'],
  
  // Sampling
  sampleRate: 1.0, // 1.0 = 100%, 0.1 = 10%
  
  // Custom contexts
  customContexts: {}
};

/* =========================================================
   CONTEXT BUILDER
========================================================= */
const buildContext = (req, res, duration) => {
  const context = {
    timestamp: new Date().toISOString(),
    request: {
      id: req.requestId || crypto.randomUUID(),
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 200),
      contentType: req.headers['content-type'],
      accept: req.headers['accept']
    },
    response: {
      status: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      durationMs: duration
    }
  };
  
  // Add user context if available
  if (loggingConfig.enrichWithUser && req.user) {
    context.user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      shift: req.user.shift
    };
  }
  
  // Add security audit if available
  if (req.securityAudit) {
    context.securityAudit = req.securityAudit;
  }
  
  // Add body analysis if available
  if (req.bodyAnalysis) {
    context.bodyAnalysis = {
      threats: req.bodyAnalysis.threats.length,
      sanitized: req.bodyAnalysis.sanitized
    };
  }
  
  // Add sanitized headers if configured
  if (loggingConfig.logHeaders) {
    const sanitizedHeaders = { ...req.headers };
    delete sanitizedHeaders.authorization;
    delete sanitizedHeaders.cookie;
    context.request.headers = sanitizedHeaders;
  }
  
  // Add request body if configured (with sensitive data filtering)
  if (loggingConfig.logRequestBody && req.body) {
    context.request.body = filterSensitiveData(req.body);
  }
  
  return context;
};

/* =========================================================
   SENSITIVE DATA FILTER
======================================================== */
const filterSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const filtered = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    
    if (loggingConfig.sensitiveFields.some(field => keyLower.includes(field.toLowerCase()))) {
      filtered[key] = '[FILTERED]';
    } else if (Array.isArray(value)) {
      filtered[key] = value.map(item => filterSensitiveData(item));
    } else if (typeof value === 'object' && value !== null) {
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  }
  
  return filtered;
};

/* =========================================================
   LOGGING MIDDLEWARE
========================================================= */
export const enhancedLogger = (options = {}) => {
  const config = { ...loggingConfig, ...options };
  
  return (req, res, next) => {
    const shouldLog = Math.random() < config.sampleRate;
    
    if (!shouldLog) {
      return next();
    }
    
    const startTime = process.hrtime.bigint();
    
    // Generate or use existing request ID
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    
    // Log request start
    if (config.logRequests) {
      logger.info('[Request] Incoming', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent']?.substring(0, 100)
      });
    }
    
    // Capture response
    const originalJson = res.json;
    res.json = function(data) {
      res.responseBody = data;
      return originalJson.call(this, data);
    };
    
    // Log on finish
    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1e6; // ms
      
      const context = buildContext(req, res, duration);
      const message = `[${context.response.status}] ${context.request.method} ${context.request.url} ${context.response.duration}`;
      
      // Determine log level based on status code
      if (context.response.status >= 500) {
        if (config.logErrors) {
          logger.error(message, {
            ...context,
            error: res.responseBody,
            stack: config.logStackTraces ? new Error().stack : undefined
          });
        }
      } else if (context.response.status >= 400) {
        logger.warn(message, context);
      } else {
        // Log slow requests
        if (config.trackSlowRequests && duration > config.slowRequestThreshold) {
          logger.warn('[Slow Request]', {
            ...context,
            threshold: config.slowRequestThreshold,
            overshoot: `${(duration - config.slowRequestThreshold).toFixed(2)}ms`
          });
        } else {
          logger.info(message, context);
        }
      }
    });
    
    next();
  };
};

/* =========================================================
   ERROR LOGGER MIDDLEWARE
======================================================== */
export const errorLogger = (options = {}) => {
  const config = { ...loggingConfig, ...options };
  
  return (err, req, res, next) => {
    const context = {
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: config.logStackTraces ? err.stack : undefined
      },
      request: {
        id: req.requestId,
        method: req.method,
        url: req.originalUrl,
        path: req.path,
        ip: req.ip,
        body: filterSensitiveData(req.body),
        query: req.query,
        params: req.params
      }
    };
    
    // Add user context if available
    if (config.enrichWithUser && req.user) {
      context.user = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      };
    }
    
    logger.error('[Unhandled Error]', context);
    
    next(err);
  };
};

/* =========================================================
   PERFORMANCE LOGGER
======================================================== */
export const performanceLogger = (options = {}) => {
  const {
    trackMemory = true,
    trackCpu = false,
    interval = 60000 // 1 minute
  } = options;
  
  const performanceData = {
    requests: [],
    memory: [],
    cpu: []
  };
  
  const logPerformance = () => {
    if (trackMemory) {
      const memoryUsage = process.memoryUsage();
      performanceData.memory.push({
        timestamp: new Date().toISOString(),
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      });
      
      // Keep only last 100 entries
      if (performanceData.memory.length > 100) {
        performanceData.memory.shift();
      }
    }
    
    logger.debug('[Performance]', {
      memory: trackMemory ? performanceData.memory[performanceData.memory.length - 1] : undefined,
      requestCount: performanceData.requests.length
    });
  };
  
  // Start performance logging interval
  const intervalId = setInterval(logPerformance, interval);
  
  // Cleanup on process exit
  process.on('SIGTERM', () => clearInterval(intervalId));
  process.on('SIGINT', () => clearInterval(intervalId));
  
  return (req, res, next) => {
    const startTime = process.hrtime.bigint();
    
    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1e6;
      
      performanceData.requests.push({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: duration,
        userId: req.user?.id
      });
      
      // Keep only last 1000 entries
      if (performanceData.requests.length > 1000) {
        performanceData.requests.shift();
      }
    });
    
    next();
  };
};

/* =========================================================
   CUSTOM CONTEXT ENRICHER
======================================================== */
export const enrichWithCustomContext = (contextName, contextBuilder) => {
  loggingConfig.customContexts[contextName] = contextBuilder;
  
  return (req, res, next) => {
    const customContext = contextBuilder(req, res);
    req.customContext = {
      ...req.customContext,
      [contextName]: customContext
    };
    next();
  };
};

/* =========================================================
   AUDIT LOG MIDDLEWARE
========================================================= */
export const auditLogger = (options = {}) => {
  const {
    actions = ['create', 'update', 'delete'],
    resources = [],
    logAllChanges = false
  } = options;
  
  return (req, res, next) => {
    // Only log specified actions
    const action = req.method.toLowerCase();
    if (!actions.includes(action) && !logAllChanges) {
      return next();
    }
    
    // Only log specified resources (or all if empty)
    const resource = req.path.split('/')[2]; // Extract resource from path
    if (resources.length > 0 && !resources.includes(resource)) {
      return next();
    }
    
    const auditLog = {
      timestamp: new Date().toISOString(),
      action: req.method,
      resource: resource,
      resourceId: req.params.id,
      userId: req.user?.id,
      userRole: req.user?.role,
      ip: req.ip,
      changes: {
        before: req.originalBody,
        after: req.body
      },
      success: res.statusCode < 400
    };
    
    // Store original body before modification
    req.originalBody = { ...req.body };
    
    res.on('finish', () => {
      auditLog.success = res.statusCode < 400;
      auditLog.changes.after = req.body;
      
      logger.info('[Audit]', auditLog);
    });
    
    next();
  };
};

/* =========================================================
   LOGGING LEVEL CONTROL
======================================================== */
export const setLoggingLevel = (level) => {
  logger.level = level;
};

export const getLoggingLevel = () => {
  return logger.level;
};

/* =========================================================
   GET LOGGING STATS
======================================================== */
export const getLoggingStats = () => {
  return {
    config: loggingConfig,
    performance: {
      requestCount: performanceLogger.requestCount || 0,
      memoryUsage: process.memoryUsage()
    }
  };
};

/* =========================================================
   PRECONFIGURED LOGGING MIDDLEWARES
======================================================== */
export const loggingMiddlewares = {
  production: enhancedLogger({
    logRequests: true,
    logResponseTime: true,
    logRequestBody: false,
    logResponseBody: false,
    logHeaders: false,
    trackSlowRequests: true,
    slowRequestThreshold: 500,
    logErrors: true,
    logStackTraces: false,
    sampleRate: 0.1 // Log 10% of requests in production
  }),
  
  development: enhancedLogger({
    logRequests: true,
    logResponseTime: true,
    logRequestBody: true,
    logResponseBody: false,
    logHeaders: true,
    trackSlowRequests: true,
    slowRequestThreshold: 1000,
    logErrors: true,
    logStackTraces: true,
    sampleRate: 1.0 // Log all requests in development
  }),
  
  testing: enhancedLogger({
    logRequests: false,
    logResponseTime: false,
    logErrors: false,
    sampleRate: 0
  }),
  
  minimal: enhancedLogger({
    logRequests: true,
    logResponseTime: false,
    logRequestBody: false,
    logHeaders: false,
    trackSlowRequests: false,
    logErrors: true,
    sampleRate: 1.0
  }),
  
  verbose: enhancedLogger({
    logRequests: true,
    logResponseTime: true,
    logRequestBody: true,
    logResponseBody: true,
    logHeaders: true,
    trackSlowRequests: true,
    slowRequestThreshold: 100,
    logErrors: true,
    logStackTraces: true,
    sampleRate: 1.0
  }),
  
  performance: performanceLogger(),
  audit: auditLogger(),
  error: errorLogger()
};

export default enhancedLogger;