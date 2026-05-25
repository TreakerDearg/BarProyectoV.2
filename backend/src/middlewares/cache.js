/* =========================================================
   HTTP CACHE MIDDLEWARE - Sistema de caché HTTP
   Mejora el rendimiento reduciendo solicitudes repetidas
========================================================= */

/* =========================================================
   CACHE CONFIGURATION
========================================================= */
const cacheConfig = {
  // Tiempos de caché por tipo de contenido (en segundos)
  cacheTimes: {
    static: 3600,           // 1 hora para contenido estático
    api: 300,              // 5 minutos para respuestas API
    apiLong: 1800,         // 30 minutos para datos que cambian poco
    dashboard: 60,         // 1 minuto para dashboard (tiempo real)
    products: 600,         // 10 minutos para productos
    menus: 1800,           // 30 minutos para menús
    inventory: 300,        // 5 minutos para inventario
  },
  
  // Tamaño máximo de caché (en bytes)
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  
  // Número máximo de entradas
  maxEntries: 1000,
  
  // Headers por defecto
  defaultHeaders: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
};

/* =========================================================
   IN-MEMORY CACHE STORE
========================================================= */
class CacheStore {
  constructor() {
    this.cache = new Map();
    this.size = 0;
    this.hits = 0;
    this.misses = 0;
  }
  
  set(key, value, ttl = cacheConfig.cacheTimes.api) {
    // Evitar superar el tamaño máximo
    if (this.size >= cacheConfig.maxEntries) {
      this.evictOldest();
    }
    
    const entry = {
      value,
      expires: Date.now() + (ttl * 1000),
      size: JSON.stringify(value).length,
      accessed: Date.now()
    };
    
    // Si la clave ya existe, restar el tamaño viejo
    if (this.cache.has(key)) {
      this.size -= this.cache.get(key).size;
    }
    
    // Verificar si hay espacio suficiente
    if (this.size + entry.size > cacheConfig.maxCacheSize) {
      this.evictUntilSpace(entry.size);
    }
    
    this.cache.set(key, entry);
    this.size += entry.size;
  }
  
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Verificar si expiró
    if (Date.now() > entry.expires) {
      this.delete(key);
      this.misses++;
      return null;
    }
    
    entry.accessed = Date.now();
    this.hits++;
    return entry.value;
  }
  
  delete(key) {
    const entry = this.cache.get(key);
    if (entry) {
      this.size -= entry.size;
      this.cache.delete(key);
    }
  }
  
  evictOldest() {
    let oldestKey = null;
    let oldestAccess = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessed < oldestAccess) {
        oldestAccess = entry.accessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
  
  evictUntilSpace(requiredSpace) {
    while (this.size + requiredSpace > cacheConfig.maxCacheSize && this.cache.size > 0) {
      this.evictOldest();
    }
  }
  
  clear() {
    this.cache.clear();
    this.size = 0;
  }
  
  getStats() {
    return {
      entries: this.cache.size,
      size: `${(this.size / 1024 / 1024).toFixed(2)}MB`,
      maxSize: `${(cacheConfig.maxCacheSize / 1024 / 1024).toFixed(2)}MB`,
      hitRate: this.hits + this.misses > 0 
        ? `${((this.hits / (this.hits + this.misses)) * 100).toFixed(2)}%`
        : '0%',
      hits: this.hits,
      misses: this.misses
    };
  }
}

const cacheStore = new CacheStore();

/* =========================================================
   CACHE KEY GENERATOR
========================================================= */
const generateCacheKey = (req) => {
  const method = req.method;
  const url = req.originalUrl;
  const userId = req.user?.id || 'anonymous';
  const query = JSON.stringify(req.query);
  
  return `${method}:${url}:${userId}:${query}`;
};

/* =========================================================
   CACHE MIDDLEWARE
========================================================= */
export const cacheMiddleware = (options = {}) => {
  const {
    ttl = cacheConfig.cacheTimes.api,
    skipCache = () => false,
    generateKey = generateCacheKey
  } = options;
  
  return (req, res, next) => {
    // Saltar caché para métodos que no son GET
    if (req.method !== 'GET') {
      return next();
    }
    
    // Verificar si se debe saltar caché
    if (skipCache(req)) {
      return next();
    }
    
    const key = generateKey(req);
    const cached = cacheStore.get(key);
    
    if (cached) {
      // Responder con caché
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', 'application/json');
      return res.json(cached);
    }
    
    // Responder normalmente y cachear
    res.setHeader('X-Cache', 'MISS');
    
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      // Solo cachear respuestas exitosas
      if (res.statusCode === 200 && data) {
        cacheStore.set(key, data, ttl);
      }
      return originalJson(data);
    };
    
    next();
  };
};

/* =========================================================
   CACHE HEADERS MIDDLEWARE
========================================================= */
export const cacheHeaders = (options = {}) => {
  const {
    maxAge = cacheConfig.cacheTimes.api,
    public: isPublic = false,
    mustRevalidate = true,
    staleWhileRevalidate = null,
    staleIfError = null
  } = options;
  
  return (req, res, next) => {
    // No aplicar caché a métodos no seguros
    if (['GET', 'HEAD'].includes(req.method)) {
      const directives = [];
      
      if (isPublic) {
        directives.push('public');
      } else {
        directives.push('private');
      }
      
      directives.push(`max-age=${maxAge}`);
      
      if (mustRevalidate) {
        directives.push('must-revalidate');
      }
      
      if (staleWhileRevalidate) {
        directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
      }
      
      if (staleIfError) {
        directives.push(`stale-if-error=${staleIfError}`);
      }
      
      res.setHeader('Cache-Control', directives.join(', '));
      res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
    } else {
      // Para métodos no seguros, indicar que no se debe cachear
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    next();
  };
};

/* =========================================================
   CACHE PURGE MIDDLEWARE - Eliminar caché específica
========================================================= */
export const purgeCache = (pattern) => {
  return (req, res, next) => {
    // Solo permitir a admins
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para purgar caché'
      });
    }
    
    const regex = new RegExp(pattern);
    let purgedCount = 0;
    
    for (const key of cacheStore.cache.keys()) {
      if (regex.test(key)) {
        cacheStore.delete(key);
        purgedCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Caché purgada: ${purgedCount} entradas eliminadas`,
      purged: purgedCount
    });
  };
};

/* =========================================================
   NO CACHE MIDDLEWARE - Desactivar caché completamente
========================================================= */
export const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Cache-Status', 'BYPASSED');
  next();
};

/* =========================================================
   CACHE STATS ENDPOINT
========================================================= */
export const getCacheStats = (req, res) => {
  res.json({
    success: true,
    stats: cacheStore.getStats(),
    config: {
      maxCacheSize: `${(cacheConfig.maxCacheSize / 1024 / 1024).toFixed(2)}MB`,
      maxEntries: cacheConfig.maxEntries,
      cacheTimes: cacheConfig.cacheTimes
    }
  });
};

/* =========================================================
   CLEAR CACHE ENDPOINT
========================================================= */
export const clearCache = (req, res) => {
  cacheStore.clear();
  res.json({
    success: true,
    message: 'Caché limpiada completamente'
  });
};

/* =========================================================
   PRECONFIGURED CACHE MIDDLEWARES
========================================================= */
export const cache = {
  static: cacheHeaders({ maxAge: cacheConfig.cacheTimes.static, public: true }),
  api: cacheMiddleware({ ttl: cacheConfig.cacheTimes.api }),
  apiLong: cacheMiddleware({ ttl: cacheConfig.cacheTimes.apiLong }),
  dashboard: cacheMiddleware({ ttl: cacheConfig.cacheTimes.dashboard }),
  products: cacheMiddleware({ ttl: cacheConfig.cacheTimes.products }),
  menus: cacheMiddleware({ ttl: cacheConfig.cacheTimes.menus }),
  inventory: cacheMiddleware({ ttl: cacheConfig.cacheTimes.inventory }),
  none: noCache
};

export default cacheMiddleware;