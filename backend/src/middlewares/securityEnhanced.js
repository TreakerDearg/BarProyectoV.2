/* =========================================================
   ENHANCED SECURITY MIDDLEWARE
   Configuración avanzada de seguridad HTTP headers
========================================================= */

import { logger } from "../config/logger.js";
import crypto from "crypto";

/* =========================================================
   SECURITY CONFIGURATION
========================================================= */
const securityConfig = {
  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 año
    includeSubDomains: true,
    preload: true
  },
  
  // CSP (Content Security Policy)
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "https:", "res.cloudinary.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
    connectSrc: ["'self'", "https://api.stripe.com", "wss://localhost:5000"],
    mediaSrc: ["'self'", "https://res.cloudinary.com"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    frameSrc: ["'none'"],
    reportUri: '/api/security/csp-report'
  },
  
  // X-Frame-Options
  frameOptions: 'DENY',
  
  // X-Content-Type-Options
  contentTypeOptions: 'nosniff',
  
  // X-XSS-Protection
  xssProtection: '1; mode=block',
  
  // Referrer Policy
  referrerPolicy: 'strict-origin-when-cross-origin',
  
  // Permissions Policy (formerly Feature Policy)
  permissionsPolicy: {
    geolocation: ["'none'"],
    microphone: ["'none'"],
    camera: ["'none'"],
    payment: ["'none'"],
    usb: ["'none'"],
    magnetometer: ["'none'"],
    gyroscope: ["'none'"],
    accelerometer: ["'none'"]
  },
  
  // Cross-Origin policies
  crossOriginEmbedderPolicy: false, // Desactivado para Electron
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'cross-origin'
};

/* =========================================================
   HSTS MIDDLEWARE
========================================================= */
export const hstsMiddleware = (options = {}) => {
  const config = { ...securityConfig.hsts, ...options };
  
  return (req, res, next) => {
    // Solo aplicar en HTTPS
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      const directives = [`max-age=${Math.floor(config.maxAge / 1000)}`];
      
      if (config.includeSubDomains) {
        directives.push('includeSubDomains');
      }
      
      if (config.preload) {
        directives.push('preload');
      }
      
      res.setHeader('Strict-Transport-Security', directives.join('; '));
      logger.debug('[Security] HSTS header applied', {
        directives: directives.join('; ')
      });
    }
    
    next();
  };
};

/* =========================================================
   CSP MIDDLEWARE (Content Security Policy)
========================================================= */
export const cspMiddleware = (options = {}) => {
  const config = { ...securityConfig.csp, ...options };
  
  return (req, res, next) => {
    const directives = [];
    
    // Build CSP directives
    if (config.defaultSrc) {
      directives.push(`default-src ${config.defaultSrc.join(' ')}`);
    }
    
    if (config.scriptSrc) {
      directives.push(`script-src ${config.scriptSrc.join(' ')}`);
    }
    
    if (config.styleSrc) {
      directives.push(`style-src ${config.styleSrc.join(' ')}`);
    }
    
    if (config.imgSrc) {
      directives.push(`img-src ${config.imgSrc.join(' ')}`);
    }
    
    if (config.fontSrc) {
      directives.push(`font-src ${config.fontSrc.join(' ')}`);
    }
    
    if (config.connectSrc) {
      directives.push(`connect-src ${config.connectSrc.join(' ')}`);
    }
    
    if (config.mediaSrc) {
      directives.push(`media-src ${config.mediaSrc.join(' ')}`);
    }
    
    if (config.objectSrc) {
      directives.push(`object-src ${config.objectSrc.join(' ')}`);
    }
    
    if (config.baseUri) {
      directives.push(`base-uri ${config.baseUri.join(' ')}`);
    }
    
    if (config.frameAncestors) {
      directives.push(`frame-ancestors ${config.frameAncestors.join(' ')}`);
    }
    
    if (config.formAction) {
      directives.push(`form-action ${config.formAction.join(' ')}`);
    }
    
    if (config.frameSrc) {
      directives.push(`frame-src ${config.frameSrc.join(' ')}`);
    }
    
    if (config.reportUri) {
      directives.push(`report-uri ${config.reportUri}`);
    }
    
    const cspValue = directives.join('; ');
    res.setHeader('Content-Security-Policy', cspValue);
    
    logger.debug('[Security] CSP header applied', {
      directives: directives.length,
      cspLength: cspValue.length
    });
    
    next();
  };
};

/* =========================================================
   X-FRAME-OPTIONS MIDDLEWARE
========================================================= */
export const frameOptionsMiddleware = (options = {}) => {
  const option = options.frameOptions || securityConfig.frameOptions;
  
  return (req, res, next) => {
    res.setHeader('X-Frame-Options', option);
    next();
  };
};

/* =========================================================
   X-CONTENT-TYPE-OPTIONS MIDDLEWARE
========================================================= */
export const contentTypeOptionsMiddleware = (options = {}) => {
  const option = options.contentTypeOptions || securityConfig.contentTypeOptions;
  
  return (req, res, next) => {
    res.setHeader('X-Content-Type-Options', option);
    next();
  };
};

/* =========================================================
   X-XSS-PROTECTION MIDDLEWARE
========================================================= */
export const xssProtectionMiddleware = (options = {}) => {
  const option = options.xssProtection || securityConfig.xssProtection;
  
  return (req, res, next) => {
    res.setHeader('X-XSS-Protection', option);
    next();
  };
};

/* =========================================================
   REFERRER POLICY MIDDLEWARE
========================================================= */
export const referrerPolicyMiddleware = (options = {}) => {
  const policy = options.referrerPolicy || securityConfig.referrerPolicy;
  
  return (req, res, next) => {
    res.setHeader('Referrer-Policy', policy);
    next();
  };
};

/* =========================================================
   PERMISSIONS POLICY MIDDLEWARE
========================================================= */
export const permissionsPolicyMiddleware = (options = {}) => {
  const config = { ...securityConfig.permissionsPolicy, ...options };
  
  return (req, res, next) => {
    const directives = [];
    
    for (const [feature, permissions] of Object.entries(config)) {
      directives.push(`${feature}=(${permissions.join(' ')})`);
    }
    
    res.setHeader('Permissions-Policy', directives.join(', '));
    
    logger.debug('[Security] Permissions Policy applied', {
      directives: directives.length
    });
    
    next();
  };
};

/* =========================================================
   NONCE GENERATOR FOR CSP
======================================================== */
export const generateNonce = () => {
  return crypto.randomBytes(16).toString('base64');
};

/* =========================================================
   CSP WITH NONCE
======================================================== */
export const cspWithNonce = (options = {}) => {
  const config = { ...securityConfig.csp, ...options };
  
  return (req, res, next) => {
    // Generate nonce for this request
    const nonce = generateNonce();
    req.cspNonce = nonce;
    
    const directives = [];
    
    // Add nonce to script-src
    const scriptSrcWithNonce = [
      ...config.scriptSrc.filter(src => src !== "'unsafe-inline'"),
      `'nonce-${nonce}'`
    ];
    
    directives.push(`default-src ${config.defaultSrc.join(' ')}`);
    directives.push(`script-src ${scriptSrcWithNonce.join(' ')}`);
    directives.push(`style-src ${config.styleSrc.join(' ')}`);
    directives.push(`img-src ${config.imgSrc.join(' ')}`);
    directives.push(`font-src ${config.fontSrc.join(' ')}`);
    directives.push(`connect-src ${config.connectSrc.join(' ')}`);
    directives.push(`object-src ${config.objectSrc.join(' ')}`);
    directives.push(`base-uri ${config.baseUri.join(' ')}`);
    directives.push(`frame-ancestors ${config.frameAncestors.join(' ')}`);
    
    if (config.reportUri) {
      directives.push(`report-uri ${config.reportUri}`);
    }
    
    const cspValue = directives.join('; ');
    res.setHeader('Content-Security-Policy', cspValue);
    
    logger.debug('[Security] CSP with nonce applied', {
      nonce: nonce.substring(0, 8) + '...'
    });
    
    next();
  };
};

/* =========================================================
   EXPECT-CT MIDDLEWARE (Certificate Transparency)
========================================================= */
export const expectCTMiddleware = (options = {}) => {
  const {
    maxAge = 86400, // 24 horas
    enforce = false,
    reportUri = null
  } = options;
  
  return (req, res, next) => {
    const directives = [`max-age=${maxAge}`];
    
    if (enforce) {
      directives.push('enforce');
    }
    
    if (reportUri) {
      directives.push(`report-uri="${reportUri}"`);
    }
    
    res.setHeader('Expect-CT', directives.join(', '));
    next();
  };
};

/* =========================================================
   CROSS-ORIGIN MIDDLEWARES
========================================================= */
export const crossOriginEmbedderPolicyMiddleware = (options = {}) => {
  const policy = options.crossOriginEmbedderPolicy ?? securityConfig.crossOriginEmbedderPolicy;
  
  return (req, res, next) => {
    if (policy === false) {
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    } else if (policy) {
      res.setHeader('Cross-Origin-Embedder-Policy', policy);
    }
    next();
  };
};

export const crossOriginOpenerPolicyMiddleware = (options = {}) => {
  const policy = options.crossOriginOpenerPolicy || securityConfig.crossOriginOpenerPolicy;
  
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', policy);
    next();
  };
};

export const crossOriginResourcePolicyMiddleware = (options = {}) => {
  const policy = options.crossOriginResourcePolicy || securityConfig.crossOriginResourcePolicy;
  
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', policy);
    next();
  };
};

/* =========================================================
   SECURITY HEADERS COMBINED
========================================================= */
export const securityHeaders = (options = {}) => {
  const config = { ...securityConfig, ...options };
  
  return [
    frameOptionsMiddleware(config),
    contentTypeOptionsMiddleware(config),
    xssProtectionMiddleware(config),
    referrerPolicyMiddleware(config),
    permissionsPolicyMiddleware(config),
    crossOriginEmbedderPolicyMiddleware(config),
    crossOriginOpenerPolicyMiddleware(config),
    crossOriginResourcePolicyMiddleware(config)
  ];
};

/* =========================================================
   SECURITY HEADERS FOR PRODUCTION
========================================================= */
export const productionSecurityHeaders = (options = {}) => {
  const config = { ...securityConfig, ...options };
  
  return [
    hstsMiddleware(config),
    cspMiddleware(config),
    ...securityHeaders(config),
    expectCTMiddleware()
  ];
};

/* =========================================================
   SECURITY HEADERS FOR DEVELOPMENT
======================================================== */
export const developmentSecurityHeaders = (options = {}) => {
  const config = { 
    ...securityConfig, 
    ...options,
    // Más relajado para desarrollo
    csp: {
      ...securityConfig.csp,
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  };
  
  return [
    frameOptionsMiddleware(config),
    contentTypeOptionsMiddleware(config),
    xssProtectionMiddleware(config),
    referrerPolicyMiddleware(config)
  ];
};

/* =========================================================
   SECURITY AUDIT MIDDLEWARE
========================================================= */
export const securityAudit = (req, res, next) => {
  const securityChecks = {
    hasSecureConnection: req.secure || req.headers['x-forwarded-proto'] === 'https',
    hasContentType: !!req.headers['content-type'],
    hasUserAgent: !!req.headers['user-agent'],
    hasReferer: !!req.headers['referer'],
    suspiciousActivity: false
  };
  
  // Detect suspicious patterns
  const suspiciousPatterns = [
    /sql/i,
    /script/i,
    /<.*>/,
    /javascript:/i,
    /on\w+\s*=/i
  ];
  
  const checkSuspicious = (value) => {
    if (!value) return false;
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };
  
  // Check various parts of the request
  if (checkSuspicious(req.query) || 
      checkSuspicious(req.params) ||
      checkSuspicious(req.body)) {
    securityChecks.suspiciousActivity = true;
  }
  
  req.securityAudit = securityChecks;
  
  if (securityChecks.suspiciousActivity) {
    logger.warn('[Security Audit] Suspicious activity detected', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.headers['user-agent']?.substring(0, 100),
      checks: securityChecks
    });
  }
  
  next();
};

/* =========================================================
   PRECONFIGURED SECURITY MIDDLEWARES
========================================================= */
export const security = {
  basic: securityHeaders(),
  production: productionSecurityHeaders(),
  development: developmentSecurityHeaders(),
  hsts: hstsMiddleware(),
  csp: cspMiddleware(),
  cspWithNonce: cspWithNonce(),
  audit: securityAudit
};

export default securityHeaders;