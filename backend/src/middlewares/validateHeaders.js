/* =========================================================
   HEADER VALIDATION MIDDLEWARE
   Valida y sanitiza headers HTTP para seguridad y compatibilidad
========================================================= */

import { logger } from "../config/logger.js";

/* =========================================================
   HEADER VALIDATION RULES
========================================================= */
const validationRules = {
  // Content-Type validation
  'content-type': {
    allowed: ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'],
    requiredFor: ['POST', 'PUT', 'PATCH']
  },
  
  // Accept header validation
  accept: {
  allowed: [
    'application/json',
    'text/plain',
    'text/html',
    '*/*'
  ],
  default: 'application/json'
},
  
  // User-Agent validation
  userAgent: {
    minLength: 5,
    maxLength: 500,
    required: false
  },
  
  // Content-Length validation
  'content-length': {
    max: 10 * 1024 * 1024, // 10MB
    requiredFor: ['POST', 'PUT', 'PATCH']
  },
  
  // Custom headers for the application
  'x-request-id': {
    pattern: /^[a-zA-Z0-9\-_]{1,100}$/,
    required: false
  },
  
  'x-api-key': {
    pattern: /^[a-zA-Z0-9\-_]{32,128}$/,
    required: false
  },
  
  'x-client-version': {
    pattern: /^\d+\.\d+\.\d+$/,
    required: false
  },
  
  'x-platform': {
    allowed: ['web', 'desktop', 'mobile', 'api'],
    required: false
  }
};

/* =========================================================
   HEADER VALIDATOR
========================================================= */
const validateHeader = (headerName, value, rules, req) => {
  // Check if required
  if (rules.requiredFor && rules.requiredFor.includes(req.method)) {
    if (!value || value === '') {
      return {
        valid: false,
        error: `Header '${headerName}' es requerido para método ${req.method}`
      };
    }
  }
  
  if (!value) return { valid: true };
  
  // Check allowed values
  if (rules.allowed) {
    const normalizedHeaderName = headerName.toLowerCase();
    const normalizedValue = value.toLowerCase();
    let valid = false;

    if (normalizedHeaderName === "content-type") {
      // Content-Type puede incluir parámetros como charset.
      const mainType = normalizedValue.split(";")[0].trim();
      valid = rules.allowed.some((allowed) => allowed.toLowerCase() === mainType);
    } else if (normalizedHeaderName === "accept") {
      // Accept puede traer una lista: "application/json, text/plain, */*"
      const acceptedTypes = normalizedValue
        .split(",")
        .map((entry) => entry.split(";")[0].trim())
        .filter(Boolean);

      valid = acceptedTypes.some((type) =>
        rules.allowed.some((allowed) => allowed.toLowerCase() === type)
      );
    } else {
      valid = rules.allowed.some((allowed) => allowed.toLowerCase() === normalizedValue);
    }

    if (!valid) {
      return {
        valid: false,
        error: `Header '${headerName}' debe ser uno de: ${rules.allowed.join(", ")}`,
        received: value
      };
    }
  }
  
  // Check pattern
  if (rules.pattern && !rules.pattern.test(value)) {
    return {
      valid: false,
      error: `Header '${headerName}' tiene formato inválido`,
      received: value
    };
  }
  
  // Check length
  if (rules.minLength && value.length < rules.minLength) {
    return {
      valid: false,
      error: `Header '${headerName}' debe tener al menos ${rules.minLength} caracteres`,
      received: value
    };
  }
  
  if (rules.maxLength && value.length > rules.maxLength) {
    return {
      valid: false,
      error: `Header '${headerName}' no debe exceder ${rules.maxLength} caracteres`,
      received: value
    };
  }
  
  // Check numeric values
  if (rules.max && parseInt(value) > rules.max) {
    return {
      valid: false,
      error: `Header '${headerName}' no debe exceder ${rules.max}`,
      received: value
    };
  }
  
  return { valid: true };
};

/* =========================================================
   SANITIZE HEADER VALUE
========================================================= */
const sanitizeHeaderValue = (value) => {
  if (typeof value !== 'string') return value;
  
  // Remove potential null bytes
  value = value.replace(/\0/g, '');
  
  // Trim whitespace
  value = value.trim();
  
  // Remove control characters except tab and newline
  value = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return value;
};

/* =========================================================
   MAIN VALIDATION MIDDLEWARE
========================================================= */
export const validateHeaders = (options = {}) => {
  const {
    rules = validationRules,
    strict = false, // If true, reject on any validation error
    addDefaults = true // Add default values for missing headers
  } = options;
  
  return (req, res, next) => {
    const errors = [];
    const warnings = [];
    
    // Validate all configured rules
    for (const [headerName, headerRules] of Object.entries(rules)) {
      const headerValue = req.headers[headerName.toLowerCase()];
      const sanitizedValue = sanitizeHeaderValue(headerValue);
      
      // Update header with sanitized value
      if (headerValue !== undefined) {
        req.headers[headerName.toLowerCase()] = sanitizedValue;
      }
      
      // Validate
      const validation = validateHeader(headerName, sanitizedValue, headerRules, req);
      
      if (!validation.valid) {
        if (strict || (headerRules.requiredFor && headerRules.requiredFor.includes(req.method))) {
          errors.push(validation);
        } else {
          warnings.push(validation);
        }
      }
      
      // Add default values
      if (addDefaults && !sanitizedValue && headerRules.default) {
        req.headers[headerName.toLowerCase()] = headerRules.default;
      }
    }
  
    // Log warnings
    if (warnings.length > 0) {
      logger.warn('[Header Validation] Warnings', {
        path: req.path,
        warnings: warnings.map(w => ({ error: w.error, received: w.received }))
      });
    }
  
    // Return errors if any in strict mode
    if (errors.length > 0) {
      logger.warn('[Header Validation] Errors', {
        path: req.path,
        errors: errors.map(e => ({ error: e.error, received: e.received }))
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validación de headers falló',
        errors: errors.map(e => e.error)
      });
    }
  
    // Add sanitized headers object
    req.sanitizedHeaders = {};
    for (const [headerName, headerRules] of Object.entries(rules)) {
      req.sanitizedHeaders[headerName] = req.headers[headerName.toLowerCase()];
    }
    
    next();
  };
};

/* =========================================================
   CONTENT TYPE VALIDATOR
========================================================= */
export const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    const contentType = req.headers['content-type'];
    
    // Skip validation for methods without body
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }
    
    if (!contentType) {
      logger.warn('[Content-Type] Missing Content-Type header', {
        method: req.method,
        path: req.path
      });
      return res.status(400).json({
        success: false,
        message: 'Content-Type header es requerido',
        allowedTypes
      });
    }
    
    // Extract the main content type (ignore charset etc)
    const mainContentType = contentType.split(';')[0].trim();
    
    if (!allowedTypes.includes(mainContentType)) {
      logger.warn('[Content-Type] Invalid Content-Type', {
        method: req.method,
        path: req.path,
        received: mainContentType,
        allowedTypes
      });
      return res.status(415).json({
        success: false,
        message: 'Content-Type no soportado',
        received: mainContentType,
        allowedTypes
      });
    }
    
    next();
  };
};

/* =========================================================
   REQUEST ID MIDDLEWARE
========================================================= */
export const requestId = (options = {}) => {
  const {
    headerName = 'x-request-id',
    generateIfMissing = true,
    addToResponse = true
  } = options;
  
  return (req, res, next) => {
    let requestId = req.headers[headerName.toLowerCase()];
    
    if (!requestId && generateIfMissing) {
      // Generate a simple UUID-like request ID
      requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    if (requestId) {
      req.requestId = requestId;
      
      if (addToResponse) {
        res.setHeader(headerName, requestId);
      }
    }
    
    next();
  };
};

/* =========================================================
   USER AGENT VALIDATOR
========================================================= */
export const validateUserAgent = (options = {}) => {
  const {
    blockBots = true,
    allowBots = ['googlebot', 'bingbot', 'slurp', 'duckduckbot'],
    required = false,
    blockEmpty = false
  } = options;
  
  return (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    
    // Check if required
    if (required && !userAgent) {
      logger.warn('[User-Agent] Missing User-Agent header', {
        ip: req.ip,
        path: req.path
      });
      return res.status(400).json({
        success: false,
        message: 'User-Agent header es requerido'
      });
    }
    
    // Block empty user agents if configured
    if (blockEmpty && !userAgent) {
      logger.warn('[User-Agent] Blocked empty User-Agent', {
        ip: req.ip,
        path: req.path
      });
      return res.status(403).json({
        success: false,
        message: 'User-Agent requerido'
      });
    }
    
    // Block bots if configured
    if (blockBots && userAgent) {
      const userAgentLower = userAgent.toLowerCase();
      const isBot = allowBots.some(bot => userAgentLower.includes(bot));
      
      // Check for common bot patterns
      const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'];
      const isKnownBot = botPatterns.some(pattern => userAgentLower.includes(pattern));
      
      if (isKnownBot && !isBot) {
        logger.warn('[User-Agent] Blocked bot', {
          ip: req.ip,
          userAgent: userAgent.substring(0, 100),
          path: req.path
        });
        return res.status(403).json({
          success: false,
          message: 'Acceso no autorizado'
        });
      }
    }
    
    // Store parsed user agent
    req.parsedUserAgent = {
      original: userAgent,
      isBot: /bot|crawler|spider|scraper/i.test(userAgent),
      isMobile: /mobile|android|iphone|ipad/i.test(userAgent),
      isDesktop: !/mobile|android|iphone|ipad/i.test(userAgent)
    };
    
    next();
  };
};

/* =========================================================
   ORIGIN VALIDATOR (for CORS enhancement)
========================================================= */
export const validateOrigin = (allowedOrigins = []) => {
  return (req, res, next) => {
    const origin = req.headers.origin;
    
    if (!origin) {
      return next();
    }
    
    if (!allowedOrigins.includes(origin)) {
      logger.warn('[Origin] Blocked unauthorized origin', {
        origin,
        allowedOrigins,
        ip: req.ip,
        path: req.path
      });
      return res.status(403).json({
        success: false,
        message: 'Origen no autorizado'
      });
    }
    
    req.validOrigin = origin;
    next();
  };
};

/* =========================================================
   HEADER SECURITY CHECK
========================================================= */
export const securityHeaders = (options = {}) => {
  const {
    addXContentTypeOptions = true,
    addXFrameOptions = true,
    addXXSSProtection = true,
    addReferrerPolicy = true,
    addPermissionsPolicy = true
  } = options;
  
  return (req, res, next) => {
    if (addXContentTypeOptions) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    
    if (addXFrameOptions) {
      res.setHeader('X-Frame-Options', 'DENY');
    }
    
    if (addXXSSProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
    
    if (addReferrerPolicy) {
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
    
    if (addPermissionsPolicy) {
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    }
    
    next();
  };
};

/* =========================================================
   PRECONFIGURED HEADER VALIDATION
========================================================= */
export const headers = {
  strict: validateHeaders({ strict: true }),
  relaxed: validateHeaders({ strict: false }),
  api: validateHeaders({
    rules: {
      'content-type': {
        allowed: ['application/json'],
        requiredFor: ['POST', 'PUT', 'PATCH']
      },
      'accept': {
        allowed: ['application/json', '*/*']
      }
    }
  }),
  multipart: validateContentType(['multipart/form-data']),
  json: validateContentType(['application/json']),
  requestId: requestId(),
  userAgent: validateUserAgent(),
  security: securityHeaders()
};

export default validateHeaders;
