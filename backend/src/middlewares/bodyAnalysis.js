/* =========================================================
   BODY ANALYSIS MIDDLEWARE
   Análisis y validación avanzada de cuerpos de solicitud
========================================================= */

import { logger } from "../config/logger.js";
import xss from "xss";

/* =========================================================
   SECURITY PATTERNS
========================================================= */
const securityPatterns = {
  // SQL Injection patterns
  sql: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION)\b)/i,
    /(\'|\")\s*(OR|AND)\s*(\d+\s*=\s*\d+)/i,
    /(\b(1=1|1=2|2=2)\b)/i,
    /(--|\#|\/\*)/,
    /(\b(WHERE|HAVING)\b.*\b(OR|AND)\b.*=)/i
  ],
  
  // XSS patterns
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /eval\s*\(/i,
    /document\.(cookie|location)/i
  ],
  
  // Command injection patterns
  command: [
    /[;&|`$()]/,
    /\.\./,
    /\/etc\//,
    /\/bin\//,
    /cmd\.exe/i,
    /powershell/i,
    /bash\s*-/i,
    /wget\s/i,
    /curl\s/i
  ],
  
  // Path traversal patterns
  pathTraversal: [
    /\.\.[\/\\]/,
    /%2e%2e%2f/i,
    /%2e%2e%5c/i,
    /%252e%252e%252f/i,
    /\.\.%5c/i,
    /\.\.%2f/i
  ],
  
  // NoSQL injection patterns
  noSql: [
    /\$where/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$in/i,
    /\$nin/i,
    /\$or/i,
    /\$and/i,
    /\{.*\$.*\}/i
  ],
  
  // Header injection patterns
  header: [
    /\r?\n/i,
    /%0d%0a/i,
    /%0d/i,
    /%0a/i
  ],
  
  // SSRF patterns
  ssrf: [
    /http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i,
    /file:\/\/\//i,
    /ftp:\/\/\//i,
    /gopher:\/\/\//i,
    /dict:\/\/\//i,
  ]
};

/* =========================================================
   BODY SIZE VALIDATION
========================================================= */
const bodySizeConfig = {
  maxJsonSize: 10 * 1024 * 1024, // 10MB
  maxTextSize: 1 * 1024 * 1024, // 1MB
  maxArrayLength: 1000,
  maxObjectDepth: 10,
  maxStringLength: 10000
};

/* =========================================================
   SECURITY ANALYZER
========================================================= */
class SecurityAnalyzer {
  constructor() {
    this.detectionCount = {
      sql: 0,
      xss: 0,
      command: 0,
      pathTraversal: 0,
      noSql: 0,
      header: 0,
      ssrf: 0
    };
    this.totalAnalyzed = 0;
  }
  
  analyze(value, type = 'unknown') {
    this.totalAnalyzed++;
    
    if (typeof value !== 'string') {
      return { safe: true, threats: [] };
    }
    
    const threats = [];
    
    // Check each security pattern
    for (const [threatType, patterns] of Object.entries(securityPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(value)) {
          threats.push({
            type: threatType,
            pattern: pattern.toString(),
            match: value.substring(0, 100)
          });
          this.detectionCount[threatType]++;
        }
      }
    }
    
    return {
      safe: threats.length === 0,
      threats,
      confidence: threats.length > 0 ? 'high' : 'none'
    };
  }
  
  getStats() {
    return {
      totalAnalyzed: this.totalAnalyzed,
      detectionCount: this.detectionCount,
      detectionRate: this.totalAnalyzed > 0 
        ? `${((Object.values(this.detectionCount).reduce((a, b) => a + b, 0) / this.totalAnalyzed) * 100).toFixed(2)}%`
        : '0%'
    };
  }
}

const analyzer = new SecurityAnalyzer();

/* =========================================================
   BODY SIZE VALIDATOR
======================================================== */
const validateBodySize = (body, contentType) => {
  const bodySize = JSON.stringify(body).length;
  
  if (contentType === 'application/json') {
    if (bodySize > bodySizeConfig.maxJsonSize) {
      return {
        valid: false,
        error: `Body size exceeds maximum of ${bodySizeConfig.maxJsonSize} bytes`,
        size: bodySize,
        maxAllowed: bodySizeConfig.maxJsonSize
      };
    }
  }
  
  return { valid: true };
};

/* =========================================================
   ARRAY LENGTH VALIDATOR
======================================================== */
const validateArrayLength = (value, path = '') => {
  if (Array.isArray(value) && value.length > bodySizeConfig.maxArrayLength) {
    return {
      valid: false,
      error: `Array length exceeds maximum of ${bodySizeConfig.maxArrayLength}`,
      path,
      length: value.length,
      maxAllowed: bodySizeConfig.maxArrayLength
    };
  }
  
  return { valid: true };
};

/* =========================================================
   OBJECT DEPTH VALIDATOR
======================================================== */
const validateObjectDepth = (obj, currentDepth = 0, path = '') => {
  if (currentDepth > bodySizeConfig.maxObjectDepth) {
    return {
      valid: false,
      error: `Object depth exceeds maximum of ${bodySizeConfig.maxObjectDepth}`,
      path,
      depth: currentDepth,
      maxAllowed: bodySizeConfig.maxObjectDepth
    };
  }
  
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      const result = validateObjectDepth(obj[key], currentDepth + 1, `${path}.${key}`);
      if (!result.valid) return result;
    }
  }
  
  return { valid: true };
};

/* =========================================================
   STRING LENGTH VALIDATOR
======================================================== */
const validateStringLength = (value, path = '') => {
  if (typeof value === 'string' && value.length > bodySizeConfig.maxStringLength) {
    return {
      valid: false,
      error: `String length exceeds maximum of ${bodySizeConfig.maxStringLength}`,
      path,
      length: value.length,
      maxAllowed: bodySizeConfig.maxStringLength
    };
  }
  
  return { valid: true };
};

/* =========================================================
   RECURSIVE BODY VALIDATION
======================================================== */
const validateBodyStructure = (obj, path = '') => {
  // Validate array length
  const arrayResult = validateArrayLength(obj, path);
  if (!arrayResult.valid) return arrayResult;
  
  // Validate object depth
  const depthResult = validateObjectDepth(obj, 0, path);
  if (!depthResult.valid) return depthResult;
  
  // Recursively validate
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = validateBodyStructure(obj[i], `${path}[${i}]`);
      if (!result.valid) return result;
    }
  } else if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const result = validateBodyStructure(obj[key], `${path}.${key}`);
      if (!result.valid) return result;
    }
  } else if (typeof obj === 'string') {
    const stringResult = validateStringLength(obj, path);
    if (!stringResult.valid) return stringResult;
  }
  
  return { valid: true };
};

/* =========================================================
   SECURITY SCAN
======================================================== */
const securityScan = (obj, path = '') => {
  const threats = [];
  
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const analysis = analyzer.analyze(value, key);
        if (!analysis.safe) {
          threats.push({
            path: `${path}.${key}`,
            threats: analysis.threats
          });
        }
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const result = securityScan(value[i], `${path}.${key}[${i}]`);
          threats.push(...result);
        }
      } else if (typeof value === 'object') {
        const result = securityScan(value, `${path}.${key}`);
        threats.push(...result);
      }
    }
  } else if (typeof obj === 'string') {
    const analysis = analyzer.analyze(obj, path);
    if (!analysis.safe) {
      threats.push({
        path: path,
        threats: analysis.threats
      });
    }
  }
  
  return threats;
};

/* =========================================================
   BODY SANITIZATION
======================================================== */
const sanitizeBody = (obj) => {
  if (typeof obj === 'string') {
    return xss(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeBody(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeBody(value);
    }
    return sanitized;
  }
  
  return obj;
};

/* =========================================================
   MAIN BODY ANALYSIS MIDDLEWARE
========================================================= */
export const bodyAnalysis = (options = {}) => {
  const {
    enableSecurityScan = true,
    enableSizeValidation = true,
    enableStructureValidation = true,
    enableSanitization = false,
    blockOnThreat = true,
    logOnly = false
  } = options;
  
  return (req, res, next) => {
    // Skip analysis for methods without body
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }
    
    const contentType = req.headers['content-type']?.split(';')[0]?.trim();
    const analysisResults = {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      contentType,
      threats: [],
      validationErrors: [],
      sanitized: false
    };
    
    // Validate body size
    if (enableSizeValidation && req.body) {
      const sizeValidation = validateBodySize(req.body, contentType);
      if (!sizeValidation.valid) {
        analysisResults.validationErrors.push(sizeValidation);
        logger.warn('[Body Analysis] Size validation failed', {
          ...sizeValidation,
          path: req.path,
          ip: req.ip
        });
        
        return res.status(413).json({
          success: false,
          message: sizeValidation.error,
          code: 'BODY_TOO_LARGE'
        });
      }
    }
    
    // Validate body structure
    if (enableStructureValidation && req.body) {
      const structureValidation = validateBodyStructure(req.body);
      if (!structureValidation.valid) {
        analysisResults.validationErrors.push(structureValidation);
        logger.warn('[Body Analysis] Structure validation failed', {
          ...structureValidation,
          path: req.path,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          message: structureValidation.error,
          code: 'BODY_STRUCTURE_INVALID',
          path: structureValidation.path
        });
      }
    }
    
    // Security scan
    if (enableSecurityScan && req.body) {
      const threats = securityScan(req.body);
      analysisResults.threats = threats;
      
      if (threats.length > 0) {
        const threatTypes = new Set(threats.map(t => t.threats.map(th => th.type)).flat());
        logger.warn('[Body Analysis] Security threats detected', {
          threatTypes: Array.from(threatTypes),
          threatCount: threats.length,
          path: req.path,
          method: req.method,
          ip: req.ip,
          userAgent: req.headers['user-agent']?.substring(0, 100)
        });
        
        if (!logOnly && blockOnThreat) {
          return res.status(400).json({
            success: false,
            message: 'Contenido potencialmente peligroso detectado',
            code: 'SECURITY_THREAT_DETECTED',
            threatTypes: Array.from(threatTypes)
          });
        }
      }
    }
    
    // Sanitize body
    if (enableSanitization && req.body) {
      req.body = sanitizeBody(req.body);
      analysisResults.sanitized = true;
    }
    
    // Attach analysis results to request
    req.bodyAnalysis = analysisResults;
    
    next();
  };
};

/* =========================================================
   XSS PROTECTION MIDDLEWARE (Simple)
========================================================= */
export const xssProtection = (options = {}) => {
  const {
    fields = [], // Empty = all fields
    strip = true
  } = options;
  
  return (req, res, next) => {
    if (!req.body || !['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }
    
    const sanitize = (obj) => {
      if (typeof obj === 'string') {
        return strip ? xss(obj) : xss(obj, { whiteList: {} });
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          if (fields.length === 0 || fields.includes(key)) {
            sanitized[key] = sanitize(value);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      }
      
      return obj;
    };
    
    req.body = sanitize(req.body);
    next();
  };
};

/* =========================================================
   SQL INJECTION PROTECTION
======================================================== */
export const sqlInjectionProtection = (options = {}) => {
  const {
    blockOnDetection = true,
    logOnly = false
  } = options;
  
  return (req, res, next) => {
    if (!req.body || !['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }
    
    const checkForSqlInjection = (value) => {
      if (typeof value !== 'string') return false;
      return securityPatterns.sql.some(pattern => pattern.test(value));
    };
    
    const scanForSql = (obj) => {
      if (typeof obj === 'string') {
        return checkForSqlInjection(obj);
      }
      
      if (Array.isArray(obj)) {
        return obj.some(item => scanForSql(item));
      }
      
      if (obj && typeof obj === 'object') {
        return Object.values(obj).some(value => scanForSql(value));
      }
      
      return false;
    };
    
    if (scanForSql(req.body)) {
      logger.warn('[SQL Injection] Potential SQL injection detected', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent']?.substring(0, 100)
      });
      
      if (!logOnly && blockOnDetection) {
        return res.status(400).json({
          success: false,
          message: 'Contenido potencialmente peligroso detectado',
          code: 'SQL_INJECTION_DETECTED'
        });
      }
    }
    
    next();
  };
};

/* =========================================================
   GET BODY ANALYSIS STATS
======================================================== */
export const getBodyAnalysisStats = () => {
  return analyzer.getStats();
};

/* =========================================================
   PRECONFIGURED BODY ANALYSIS MIDDLEWARES
======================================================== */
export const bodyAnalysisMiddlewares = {
  strict: bodyAnalysis({
    enableSecurityScan: true,
    enableSizeValidation: true,
    enableStructureValidation: true,
    enableSanitization: true,
    blockOnThreat: true,
    logOnly: false
  }),
  
  moderate: bodyAnalysis({
    enableSecurityScan: true,
    enableSizeValidation: true,
    enableStructureValidation: false,
    enableSanitization: false,
    blockOnThreat: true,
    logOnly: false
  }),
  
  lenient: bodyAnalysis({
    enableSecurityScan: true,
    enableSizeValidation: false,
    enableStructureValidation: false,
    enableSanitization: false,
    blockOnThreat: false,
    logOnly: true
  }),
  
  xssOnly: xssProtection(),
  sqlOnly: sqlInjectionProtection(),
  fullSanitize: xssProtection({ strip: true })
};

export default bodyAnalysis;