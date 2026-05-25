/* =========================================================
   SOCKET EVENTS - Bartender System
   Eventos para notificar cambios en tiempo real a todos los clientes conectados
========================================================= */

let ioInstance = null;

/**
 * Inicializa la instancia de Socket.IO
 * Debe llamarse desde server.js después de crear la instancia
 */
export const initializeSocketEvents = (io) => {
  ioInstance = io;
};

/**
 * Emite eventos de menú
 */
export const emitMenuEvent = (event, data) => {
  if (!ioInstance) {
    console.warn('[SocketEvents] io no inicializado');
    return;
  }

  ioInstance.emit(`menu:${event}`, data);
};

/**
 * Emite eventos de producto
 */
export const emitProductEvent = (event, data) => {
  if (!ioInstance) {
    console.warn('[SocketEvents] io no inicializado');
    return;
  }

  ioInstance.emit(`product:${event}`, data);
};

/**
 * Emite eventos de receta
 */
export const emitRecipeEvent = (event, data) => {
  if (!ioInstance) {
    console.warn('[SocketEvents] io no inicializado');
    return;
  }

  ioInstance.emit(`recipe:${event}`, data);
};

/* =========================================================
   CONSTANTES DE EVENTOS
   Para usar en los controllers
========================================================= */
export const MENU_EVENTS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
};

export const PRODUCT_EVENTS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  AVAILABILITY_CHANGED: 'availability_changed',
};

export const RECIPE_EVENTS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
};
