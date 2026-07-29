/* =========================================================
   TENANT CONTEXT
   Estructura preparada para multi-tenant (múltiples restaurantes/sucursales)
   Preparada para futura implementación
========================================================= */

/**
 * Crea un contexto de tenant
 * @param {Object} options - Opciones del tenant
 * @returns {Object} Contexto de tenant
 */
export const createTenantContext = (options = {}) => {
  return {
    // Identificación del tenant
    tenantId: options.tenantId || null,
    tenantName: options.tenantName || null,
    tenantSlug: options.tenantSlug || null,

    // Configuración del tenant
    config: {
      currency: options.config?.currency || 'USD',
      language: options.config?.language || 'es',
      timezone: options.config?.timezone || 'America/Argentina/Buenos_Aires',
      dateFormat: options.config?.dateFormat || 'DD/MM/YYYY',
      timeFormat: options.config?.timeFormat || 'HH:mm',
    },

    // Límites del tenant
    limits: {
      maxUsers: options.limits?.maxUsers || null,
      maxBranches: options.limits?.maxBranches || null,
      maxTables: options.limits?.maxTables || null,
    },

    // Estado
    isActive: options.isActive !== false,
    isTrial: options.isTrial || false,
    trialEndsAt: options.trialEndsAt || null,

    // Metadatos
    metadata: {
      createdAt: options.metadata?.createdAt || null,
      updatedAt: options.metadata?.updatedAt || null,
    },
  };
};

/**
 * Extrae el contexto de tenant desde una request
 * @param {Object} req - Request de Express
 * @returns {Object} Contexto de tenant
 */
export const extractTenantContext = (req) => {
  // TODO: Implementar extracción de tenant desde:
  // - Header X-Tenant-ID
  // - Subdomain (ej: restaurant1.bartender.com)
  // - Path (ej: /api/restaurant1/...)
  // - Cookie
  return createTenantContext();
};

/**
 * Verifica si un usuario pertenece a un tenant
 * @param {Object} user - Usuario
 * @param {string} tenantId - ID del tenant
 * @returns {boolean}
 */
export const userBelongsToTenant = (user, tenantId) => {
  // TODO: Implementar verificación cuando se agregue campo tenantId al modelo User
  return true;
};

/**
 * Filtra datos por tenant
 * @param {Array} data - Datos a filtrar
 * @param {string} tenantId - ID del tenant
 * @returns {Array} Datos filtrados
 */
export const filterByTenant = (data, tenantId) => {
  // TODO: Implementar filtrado cuando se agregue campo tenantId a los modelos
  return data;
};
