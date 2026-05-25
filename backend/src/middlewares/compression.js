import compression from "compression";
import { logger } from "../config/logger.js";

/* =========================================================
   COMPRESSION MIDDLEWARE - Compresión gzip mejorada
   Optimiza el tamaño de las respuestas para mejorar rendimiento
========================================================= */

const compressionOptions = {
  // Nivel de compresión (0-9, donde 9 es máxima compresión pero más lento)
  level: 6,
  
  // Solo comprimir respuestas mayores a este tamaño (bytes)
  threshold: 1024, // 1KB
  
  // Tipos de contenido a comprimir
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      // Permitir desactivar compresión con header
      return false;
    }
    
    // No comprimir si ya está comprimido
    const contentType = res.getHeader('Content-Type');
    if (contentType && (contentType.includes('image/') || 
                        contentType.includes('video/') || 
                        contentType.includes('application/zip'))) {
      return false;
    }
    
    return compression.filter(req, res);
  },
  
  // Tamaño del buffer para compresión
  chunkSize: 16 * 1024, // 16KB
  
  // WindowBits para compresión
  windowBits: 15
};

/* =========================================================
   COMPRESSION STATS - Estadísticas de compresión
========================================================= */
const compressionStats = {
  totalRequests: 0,
  compressedRequests: 0,
  totalBytes: 0,
  compressedBytes: 0,
  savings: 0
};

/* =========================================================
   COMPRESSION MIDDLEWARE WITH STATS
========================================================= */
export const compressionMiddleware = compression(compressionOptions);

/* =========================================================
   COMPRESSION WITH LOGGING
========================================================= */
export const compressionWithLogging = (req, res, next) => {
  const originalWrite = res.write;
  const originalEnd = res.end;
  let uncompressedSize = 0;
  
  // Interceptar write para capturar tamaño sin comprimir
  res.write = function(chunk, encoding, callback) {
    uncompressedSize += Buffer.byteLength(chunk, encoding);
    return originalWrite.call(this, chunk, encoding, callback);
  };
  
  // Interceptar end para capturar tamaño final
  res.end = function(chunk, encoding, callback) {
    if (chunk) {
      uncompressedSize += Buffer.byteLength(chunk, encoding);
    }
    
    const contentEncoding = res.getHeader('Content-Encoding');
    if (contentEncoding === 'gzip' || contentEncoding === 'deflate') {
      compressionStats.compressedRequests++;
      const compressedSize = res.getHeader('Content-Length') || 0;
      const savings = uncompressedSize - compressedSize;
      const savingsPercent = ((savings / uncompressedSize) * 100).toFixed(2);
      
      compressionStats.totalBytes += uncompressedSize;
      compressionStats.compressedBytes += compressedSize;
      compressionStats.savings += savings;
      
      logger.debug('[Compression] Respuesta comprimida', {
        path: req.path,
        originalSize: `${(uncompressedSize / 1024).toFixed(2)}KB`,
        compressedSize: `${(compressedSize / 1024).toFixed(2)}KB`,
        savings: `${savingsPercent}%`,
        encoding: contentEncoding
      });
    }
    
    compressionStats.totalRequests++;
    
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  // Aplicar compresión
  compressionMiddleware(req, res, next);
};

/* =========================================================
   GET COMPRESSION STATS
========================================================= */
export const getCompressionStats = () => {
  const avgSavings = compressionStats.compressedRequests > 0 
    ? ((compressionStats.savings / compressionStats.totalBytes) * 100).toFixed(2)
    : 0;
  
  return {
    totalRequests: compressionStats.totalRequests,
    compressedRequests: compressionStats.compressedRequests,
    compressionRatio: compressionStats.totalRequests > 0 
      ? `${((compressionStats.compressedRequests / compressionStats.totalRequests) * 100).toFixed(2)}%`
      : '0%',
    totalBytes: `${(compressionStats.totalBytes / 1024 / 1024).toFixed(2)}MB`,
    compressedBytes: `${(compressionStats.compressedBytes / 1024 / 1024).toFixed(2)}MB`,
    totalSavings: `${(compressionStats.savings / 1024 / 1024).toFixed(2)}MB`,
    averageSavings: `${avgSavings}%`
  };
};

/* =========================================================
   RESET COMPRESSION STATS
========================================================= */
export const resetCompressionStats = () => {
  compressionStats.totalRequests = 0;
  compressionStats.compressedRequests = 0;
  compressionStats.totalBytes = 0;
  compressionStats.compressedBytes = 0;
  compressionStats.savings = 0;
};

export default compressionMiddleware;