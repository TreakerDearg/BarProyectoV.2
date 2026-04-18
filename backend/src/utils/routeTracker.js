export const routeTracker = {
  services: [],
};

/**
 * Registra un módulo de API
 */
export const registerService = (name, basePath) => {
  const exists = routeTracker.services.find(s => s.name === name);

  if (!exists) {
    routeTracker.services.push({
      name,
      basePath,
      status: "unknown",
      lastCheck: null,
    });
  }
};

/**
 * Actualiza estado del servicio
 */
export const updateServiceStatus = (name, status) => {
  const service = routeTracker.services.find(s => s.name === name);

  if (service) {
    service.status = status;
    service.lastCheck = new Date().toISOString();
  }
};