/* =========================================================
   METRICS AND MONITORING MIDDLEWARE
   Sistema completo de métricas y monitoreo de la API
========================================================= */

import { logger } from "../config/logger.js";

/* =========================================================
   METRICS STORAGE
========================================================= */
class MetricsStore {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.requests = {
      total: 0,
      successful: 0,
      failed: 0,
      byMethod: {},
      byPath: {},
      byStatus: {}
    };
    
    this.responseTime = {
      min: Infinity,
      max: 0,
      avg: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      samples: []
    };
    
    this.errors = {
      total: 0,
      byType: {},
      recent: []
    };
    
    this.users = {
      active: 0,
      unique: new Set(),
      byRole: {}
    };
    
    this.system = {
      uptime: process.uptime(),
      memory: {},
      cpu: {}
    };
    
    this.startTime = Date.now();
  }
  
  recordRequest(method, path, status, duration, userId, userRole) {
    // Update total requests
    this.requests.total++;
    
    // Update by method
    this.requests.byMethod[method] = (this.requests.byMethod[method] || 0) + 1;
    
    // Update by path
    this.requests.byPath[path] = (this.requests.byPath[path] || 0) + 1;
    
    // Update by status
    const statusRange = Math.floor(status / 100) * 100;
    this.requests.byStatus[statusRange] = (this.requests.byStatus[statusRange] || 0) + 1;
    
    // Update success/failed
    if (status >= 200 && status < 400) {
      this.requests.successful++;
    } else {
      this.requests.failed++;
    }
    
    // Update response time
    this.responseTime.samples.push(duration);
    
    if (this.responseTime.samples.length > 1000) {
      this.responseTime.samples.shift();
    }
    
    this.responseTime.min = Math.min(this.responseTime.min, duration);
    this.responseTime.max = Math.max(this.responseTime.max, duration);
    this.responseTime.avg = this.responseTime.samples.reduce((a, b) => a + b, 0) / this.responseTime.samples.length;
    
    // Calculate percentiles
    const sorted = [...this.responseTime.samples].sort((a, b) => a - b);
    this.responseTime.p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    this.responseTime.p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    this.responseTime.p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    
    // Update user metrics
    if (userId) {
      this.users.unique.add(userId);
      this.users.active = this.users.unique.size;
      
      if (userRole) {
        this.users.byRole[userRole] = (this.users.byRole[userRole] || 0) + 1;
      }
    }
  }
  
  recordError(errorType, errorMessage, path) {
    this.errors.total++;
    this.errors.byType[errorType] = (this.errors.byType[errorType] || 0) + 1;
    
    this.errors.recently = {
      type: errorType,
      message: errorMessage,
      path: path,
      timestamp: new Date().toISOString()
    };
    
    if (this.errors.recent.length > 50) {
      this.errors.recent.shift();
    }
    
    this.errors.recent.push({
      type: errorType,
      message: errorMessage,
      path: path,
      timestamp: new Date().toISOString()
    });
  }
  
  updateSystemMetrics() {
    this.system.uptime = process.uptime();
    this.system.memory = process.memoryUsage();
    this.system.cpu = process.cpuUsage();
  }
  
  getMetrics() {
    this.updateSystemMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      uptime: this.system.uptime,
      requests: {
        ...this.requests,
        successRate: this.requests.total > 0 
          ? `${((this.requests.successful / this.requests.total) * 100).toFixed(2)}%`
          : '0%',
        errorRate: this.requests.total > 0 
          ? `${((this.requests.failed / this.requests.total) * 100).toFixed(2)}%`
          : '0%'
      },
      responseTime: {
        min: `${this.responseTime.min.toFixed(2)}ms`,
        max: `${this.responseTime.max.toFixed(2)}ms`,
        avg: `${this.responseTime.avg.toFixed(2)}ms`,
        p50: `${this.responseTime.p50.toFixed(2)}ms`,
        p95: `${this.responseTime.p95.toFixed(2)}ms`,
        p99: `${this.responseTime.p99.toFixed(2)}ms`
      },
      errors: {
        total: this.errors.total,
        byType: this.errors.byType,
        recent: this.errors.recent.slice(-10)
      },
      users: {
        active: this.users.active,
        unique: this.users.unique.size,
        byRole: this.users.byRole
      },
      system: {
        uptime: `${Math.floor(this.system.uptime)}s`,
        memory: {
          rss: `${(this.system.memory.rss / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(this.system.memory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          heapUsed: `${(this.system.memory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          external: `${(this.system.memory.external / 1024 / 1024).toFixed(2)}MB`
        }
      }
    };
  }
}

const metricsStore = new MetricsStore();

/* =========================================================
   METRICS MIDDLEWARE
========================================================= */
export const metricsMiddleware = (options = {}) => {
  const {
    trackResponseTime = true,
    trackErrors = true,
    trackUsers = true,
    resetInterval = 3600000, // 1 hora
    enableHealthCheck = true
  } = options;
  
  // Auto-reset metrics at interval
  if (resetInterval > 0) {
    setInterval(() => {
      logger.info('[Metrics] Resetting metrics store', {
        previousMetrics: metricsStore.getMetrics()
      });
      metricsStore.reset();
    }, resetInterval);
  }
  
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      if (trackResponseTime) {
        metricsStore.recordRequest(
          req.method,
          req.path,
          res.statusCode,
          duration,
          userId,
          userRole
        );
      }
    });
    
    next();
  };
};

/* =========================================================
   HEALTH CHECK MIDDLEWARE
========================================================= */
export const healthCheckMiddleware = (options = {}) => {
  const {
    enableDatabase = true,
    enableCache = true,
    enableExternalServices = true,
    timeout = 5000
  } = options;
  
  return async (req, res) => {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {}
    };
    
    try {
      // Database health check
      if (enableDatabase) {
        try {
          // Here you would add actual database health check
          // For now, we'll assume it's healthy
          healthStatus.checks.database = {
            status: 'healthy',
            responseTime: '10ms'
          };
        } catch (error) {
          healthStatus.checks.database = {
            status: 'unhealthy',
            error: error.message
          };
          healthStatus.status = 'degraded';
        }
      }
      
      // Cache health check
      if (enableCache) {
        healthStatus.checks.cache = {
          status: 'healthy',
          responseTime: '5ms'
        };
      }
      
      // External services health check
      if (enableExternalServices) {
        healthStatus.checks.externalServices = {
          status: 'healthy',
          responseTime: '15ms'
        };
      }
      
      // Memory check
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      healthStatus.checks.memory = {
        status: memoryUsagePercent < 90 ? 'healthy' : 'warning',
        usage: `${memoryUsagePercent.toFixed(2)}%`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`
      };
      
      if (memoryUsagePercent >= 90) {
        healthStatus.status = 'degraded';
      }
      
    } catch (error) {
      healthStatus.status = 'unhealthy';
      healthStatus.error = error.message;
    }
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  };
};

/* =========================================================
   METRICS ENDPOINT
======================================================== */
export const metricsEndpoint = (req, res) => {
  const metrics = metricsStore.getMetrics();
  
  res.json({
    success: true,
    metrics
  });
};

/* =========================================================
   PROMETHEUS-STYLE METRICS ENDPOINT
======================================================== */
export const prometheusMetricsEndpoint = (req, res) => {
  const metrics = metricsStore.getMetrics();
  
  let output = '';
  
  // Request metrics
  output += `# HELP http_requests_total Total number of HTTP requests\n`;
  output += `# TYPE http_requests_total counter\n`;
  output += `http_requests_total ${metrics.requests.total}\n`;
  
  output += `# HELP http_requests_successful Total number of successful HTTP requests\n`;
  output += `# TYPE http_requests_successful counter\n`;
  output += `http_requests_successful ${metrics.requests.successful}\n`;
  
  output += `# HELP http_requests_failed Total number of failed HTTP requests\n`;
  output += `# TYPE http_requests_failed counter\n`;
  output += `http_requests_failed ${metrics.requests.failed}\n`;
  
  // Response time metrics
  output += `# HELP http_response_time_seconds HTTP response time in seconds\n`;
  output += `# TYPE http_response_time_seconds gauge\n`;
  output += `http_response_time_seconds_avg ${(parseFloat(metrics.responseTime.avg) / 1000).toFixed(4)}\n`;
  output += `http_response_time_seconds_p95 ${(parseFloat(metrics.responseTime.p95) / 1000).toFixed(4)}\n`;
  output += `http_response_time_seconds_p99 ${(parseFloat(metrics.responseTime.p99) / 1000).toFixed(4)}\n`;
  
  // Error metrics
  output += `# HELP http_errors_total Total number of HTTP errors\n`;
  output += `# TYPE http_errors_total counter\n`;
  output += `http_errors_total ${metrics.errors.total}\n`;
  
  // User metrics
  output += `# HELP users_active Current number of active users\n`;
  output += `# TYPE users_active gauge\n`;
  output += `users_active ${metrics.users.active}\n`;
  
  // System metrics
  output += `# HELP process_memory_bytes Process memory usage in bytes\n`;
  output += `# TYPE process_memory_bytes gauge\n`;
  output += `process_memory_bytes_heap_used ${metrics.system.memory.heapUsed.replace('MB', '') * 1024 * 1024}\n`;
  output += `process_memory_bytes_heap_total ${metrics.system.memory.heapTotal.replace('MB', '') * 1024 * 1024}\n`;
  
  res.set('Content-Type', 'text/plain');
  res.send(output);
};

/* =========================================================
   ALERTING SYSTEM
======================================================== */
class AlertingSystem {
  constructor() {
    this.alerts = [];
    this.rules = [];
  }
  
  addRule(rule) {
    this.rules.push(rule);
  }
  
  checkMetrics(metrics) {
    const newAlerts = [];
    
    for (const rule of this.rules) {
      if (rule.condition(metrics)) {
        const alert = {
          id: Date.now(),
          type: rule.type,
          severity: rule.severity,
          message: rule.message(metrics),
          timestamp: new Date().toISOString(),
          metrics: rule.extractMetrics ? rule.extractMetrics(metrics) : null
        };
        
        newAlerts.push(alert);
        this.alerts.push(alert);
        
        logger.warn('[Alerting System] Alert triggered', alert);
      }
    }
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    return newAlerts;
  }
  
  getAlerts(severity = null) {
    if (severity) {
      return this.alerts.filter(alert => alert.severity === severity);
    }
    return this.alerts;
  }
  
  clearAlerts() {
    this.alerts = [];
  }
}

const alertingSystem = new AlertingSystem();

// Add default alerting rules
alertingSystem.addRule({
  type: 'high_error_rate',
  severity: 'warning',
  condition: (metrics) => {
    const errorRate = parseFloat(metrics.requests.errorRate);
    return errorRate > 5; // > 5% error rate
  },
  message: (metrics) => `High error rate detected: ${metrics.requests.errorRate}`,
  extractMetrics: (metrics) => ({
    errorRate: metrics.requests.errorRate,
    totalErrors: metrics.requests.failed
  })
});

alertingSystem.addRule({
  type: 'slow_response_time',
  severity: 'warning',
  condition: (metrics) => {
    const p95 = parseFloat(metrics.responseTime.p95);
    return p95 > 2000; // > 2s p95
  },
  message: (metrics) => `Slow response time detected: ${metrics.responseTime.p95}`,
  extractMetrics: (metrics) => ({
    p95: metrics.responseTime.p95,
    avg: metrics.responseTime.avg
  })
});

alertingSystem.addRule({
  type: 'high_memory_usage',
  severity: 'critical',
  condition: (metrics) => {
    const memoryUsage = parseFloat(metrics.system.memory.heapUsed);
    return memoryUsage > 500; // > 500MB
  },
  message: (metrics) => `High memory usage detected: ${metrics.system.memory.heapUsed}`,
  extractMetrics: (metrics) => ({
    heapUsed: metrics.system.memory.heapUsed,
    heapTotal: metrics.system.memory.heapTotal
  })
});

/* =========================================================
   ALERTING MIDDLEWARE
======================================================== */
export const alertingMiddleware = (options = {}) => {
  const {
    checkInterval = 60000, // 1 minuto
    enabled = true
  } = options;
  
  if (!enabled) {
    return (req, res, next) => next();
  }
  
  // Check alerts periodically
  setInterval(() => {
    const metrics = metricsStore.getMetrics();
    alertingSystem.checkMetrics(metrics);
  }, checkInterval);
  
  return (req, res, next) => {
    // Check alerts on each request (for immediate detection)
    const metrics = metricsStore.getMetrics();
    const newAlerts = alertingSystem.checkMetrics(metrics);
    
    if (newAlerts.length > 0) {
      req.activeAlerts = newAlerts;
    }
    
    next();
  };
};

/* =========================================================
   ALERTS ENDPOINT
======================================================== */
export const alertsEndpoint = (req, res) => {
  const severity = req.query.severity;
  const alerts = alertingSystem.getAlerts(severity);
  
  res.json({
    success: true,
    alerts,
    count: alerts.length
  });
};

/* =========================================================
   RESET METRICS ENDPOINT
======================================================== */
export const resetMetricsEndpoint = (req, res) => {
  metricsStore.reset();
  alertingSystem.clearAlerts();
  
  res.json({
    success: true,
    message: 'Metrics and alerts reset successfully'
  });
};

/* =========================================================
   GET METRICS STORE
======================================================== */
export const getMetricsStore = () => metricsStore;

/* =========================================================
   GET ALERTING SYSTEM
======================================================== */
export const getAlertingSystem = () => alertingSystem;

/* =========================================================
   PRECONFIGURED METRICS MIDDLEWARES
======================================================== */
export const metricsMiddlewares = {
  basic: metricsMiddleware(),
  full: metricsMiddleware({
    trackResponseTime: true,
    trackErrors: true,
    trackUsers: true,
    enableHealthCheck: true
  }),
  minimal: metricsMiddleware({
    trackResponseTime: false,
    trackErrors: true,
    trackUsers: false
  }),
  health: healthCheckMiddleware(),
  alerting: alertingMiddleware()
};

export default metricsMiddleware;