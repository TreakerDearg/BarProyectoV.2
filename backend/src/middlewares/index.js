/* =========================================================
   MIDDLEWARES INDEX - Exportaciones centralizadas
   Organización modular de todos los middlewares
========================================================= */

// =========================================================
// CORE MIDDLEWARES
// =========================================================
import { default as errorHandler } from "./errorHandler.js";
import { default as asyncHandler } from "./asyncHandler.js";
import { default as sanitize } from "./sanitize.js";
import { validateObjectId } from "./validateObjectId.js";

// Re-export core middlewares
export { default as errorHandler } from "./errorHandler.js";
export { default as asyncHandler } from "./asyncHandler.js";
export { default as sanitize } from "./sanitize.js";
export { validateObjectId } from "./validateObjectId.js";

// =========================================================
// AUTHENTICATION & AUTHORIZATION
// =========================================================
import {
  protect,
  optionalAuth,
  authorizeRoles,
  authorizePermissions,
  validateShift,
  auth
} from "./auth.middleware.js";

export {
  protect,
  optionalAuth,
  authorizeRoles,
  authorizePermissions,
  validateShift,
  auth
} from "./auth.middleware.js";

// =========================================================
// VALIDATION
// =========================================================
import {
  validate,
  validateParams,
  validateQuery
} from "./validate.js";

export {
  validate,
  validateParams,
  validateQuery
} from "./validate.js";

// =========================================================
// COMPRESSION
// =========================================================
import {
  compressionMiddleware,
  compressionWithLogging,
  getCompressionStats,
  resetCompressionStats
} from "./compression.js";

export {
  compressionMiddleware,
  compressionWithLogging,
  getCompressionStats,
  resetCompressionStats
} from "./compression.js";

// =========================================================
// CACHING
// =========================================================
import {
  cacheMiddleware,
  cacheHeaders,
  purgeCache,
  noCache,
  getCacheStats,
  clearCache,
  cache
} from "./cache.js";

export {
  cacheMiddleware,
  cacheHeaders,
  purgeCache,
  noCache,
  getCacheStats,
  clearCache,
  cache
} from "./cache.js";

// =========================================================
// RATE LIMITING
// =========================================================
import {
  createRateLimit as createRateLimitFn,
  adaptiveRateLimit,
  roleBasedRateLimit,
  ddosProtection,
  getRateLimitMetrics,
  resetRateLimit,
  rateLimiters
} from "./rateLimitEnhanced.js";

export {
  createRateLimit as createRateLimitFn,
  adaptiveRateLimit,
  roleBasedRateLimit,
  ddosProtection,
  getRateLimitMetrics,
  resetRateLimit,
  rateLimiters
} from "./rateLimitEnhanced.js";

// Legacy exports for backward compatibility
import { apiLimiter, authLimiter, orderLimiter } from "./rateLimitEnhanced.js";
export { apiLimiter, authLimiter, orderLimiter } from "./rateLimitEnhanced.js";

// Export default as createRateLimit
import { default as createRateLimitDefault } from "./rateLimitEnhanced.js";
export { default as createRateLimit } from "./rateLimitEnhanced.js";

// =========================================================
// SECURITY
// =========================================================
import {
  hstsMiddleware,
  cspMiddleware,
  frameOptionsMiddleware,
  contentTypeOptionsMiddleware,
  xssProtectionMiddleware,
  referrerPolicyMiddleware,
  permissionsPolicyMiddleware,
  cspWithNonce,
  expectCTMiddleware,
  crossOriginEmbedderPolicyMiddleware,
  crossOriginOpenerPolicyMiddleware,
  crossOriginResourcePolicyMiddleware,
  securityHeaders,
  productionSecurityHeaders,
  developmentSecurityHeaders,
  securityAudit,
  security
} from "./securityEnhanced.js";

export {
  hstsMiddleware,
  cspMiddleware,
  frameOptionsMiddleware,
  contentTypeOptionsMiddleware,
  xssProtectionMiddleware,
  referrerPolicyMiddleware,
  permissionsPolicyMiddleware,
  cspWithNonce,
  expectCTMiddleware,
  crossOriginEmbedderPolicyMiddleware,
  crossOriginOpenerPolicyMiddleware,
  crossOriginResourcePolicyMiddleware,
  securityHeaders,
  productionSecurityHeaders,
  developmentSecurityHeaders,
  securityAudit,
  security
} from "./securityEnhanced.js";

// =========================================================
// HEADER VALIDATION
// =========================================================
import {
  validateHeaders,
  validateContentType,
  requestId,
  validateUserAgent,
  validateOrigin,
  securityHeaders as headerSecurityHeaders,
  headers
} from "./validateHeaders.js";

export {
  validateHeaders,
  validateContentType,
  requestId,
  validateUserAgent,
  validateOrigin,
  securityHeaders as headerSecurityHeaders,
  headers
} from "./validateHeaders.js";

// =========================================================
// BODY ANALYSIS
// =========================================================
import {
  bodyAnalysis,
  xssProtection,
  sqlInjectionProtection,
  getBodyAnalysisStats,
  bodyAnalysisMiddlewares
} from "./bodyAnalysis.js";

export {
  bodyAnalysis,
  xssProtection,
  sqlInjectionProtection,
  getBodyAnalysisStats,
  bodyAnalysisMiddlewares
} from "./bodyAnalysis.js";

// =========================================================
// LOGGING
// =========================================================
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

export {
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

// Legacy export for backward compatibility
import { httpLogger } from "./logger.js";
export { httpLogger } from "./logger.js";

// =========================================================
// METRICS & MONITORING
// =========================================================
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

export {
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

// =========================================================
// CONFIGURATION
// =========================================================
import {
  MiddlewareBuilder,
  buildMiddlewareChain,
  composeMiddleware,
  conditionalMiddleware,
  envMiddleware,
  withMiddleware,
  getMiddlewarePreset,
  registerCustomPreset,
  middleware
} from "./middlewareConfig.js";

// Re-export configuration items
export {
  MiddlewareBuilder,
  buildMiddlewareChain,
  composeMiddleware,
  conditionalMiddleware,
  envMiddleware,
  withMiddleware,
  getMiddlewarePreset,
  registerCustomPreset,
  middleware
};

// Extract presets from middleware object
export const presets = middleware.presets;
export const routeConfigs = middleware.routeConfigs;

// =========================================================
// SPECIALIZED MIDDLEWARES
// =========================================================
import { serviceTracker } from "./serviceTracker.js";
import { default as upload } from "./upload.js";
import {
  uploadSingle,
  uploadMultiple,
  uploadFields
} from "./upload.js";

export { serviceTracker } from "./serviceTracker.js";
export { default as upload } from "./upload.js";
export {
  uploadSingle,
  uploadMultiple,
  uploadFields
} from "./upload.js";

// =========================================================
// DEFAULT EXPORT
// =========================================================
export default {
  // Core
  errorHandler,
  asyncHandler,
  sanitize,
  validateObjectId,
  
  // Auth
  protect,
  authorizeRoles,
  authorizePermissions,
  
  // Validation
  validate,
  validateParams,
  validateQuery,
  validateObjectId,
  
  // Performance
  compressionMiddleware,
  cache,
  rateLimiters,
  
  // Security
  security,
  validateHeaders,
  bodyAnalysis,
  
  // Monitoring
  enhancedLogger,
  metricsMiddlewares,
  
  // Configuration
  MiddlewareBuilder,
  presets,
  routeConfigs,
  
  // Specialized
  upload,
  serviceTracker
};