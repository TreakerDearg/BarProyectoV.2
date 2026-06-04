import { useEffect, useCallback, useRef } from "react";
import {
  default as socketService,
  getSocket,
  onMenuCreated,
  onMenuUpdated,
  onMenuDeleted,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  onProductAvailabilityChanged,
  onRecipeCreated,
  onRecipeUpdated,
  onRecipeDeleted,
  onInventoryCreated,
  onInventoryUpdated,
  onInventoryStockChanged,
  disconnectSocket,
} from "../services/socket";
import type { MenuEventData, ProductEventData, RecipeEventData, InventoryEventData } from "../services/socket";
import { getToken } from "../utils/tokenStorage";

/* =========================================================
   HOOK PERSONALIZADO: useSocket
   Facilita la suscripción a eventos de Socket.IO en componentes React
========================================================= */

export const useSocket = () => {
  const socketRef = useRef(getSocket());
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Conectar al montar
    if (!getSocket()) {
      socketService.connect(getToken() || undefined);
    }

    socketRef.current = getSocket();

    // Limpiar todas las suscripciones al desmontar
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      disconnectSocket();
    };
  }, []);

  /* =========================================================
     MENU EVENTS
  ========================================================= */
  const useMenuEvents = useCallback((
    onCreated?: (data: MenuEventData) => void,
    onUpdated?: (data: MenuEventData) => void,
    onDeleted?: (data: MenuEventData) => void
  ) => {
    useEffect(() => {
      const cleanups: (() => void)[] = [];

      if (onCreated) {
        const cleanup = onMenuCreated(onCreated);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      if (onUpdated) {
        const cleanup = onMenuUpdated(onUpdated);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      if (onDeleted) {
        const cleanup = onMenuDeleted(onDeleted);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      return () => {
        cleanups.forEach(cleanup => cleanup());
      };
    }, [onCreated, onUpdated, onDeleted]);
  }, []);

  /* =========================================================
     PRODUCT EVENTS
  ========================================================= */
  const useProductEvents = useCallback((
    onCreated?: (data: ProductEventData) => void,
    onUpdated?: (data: ProductEventData) => void,
    onDeleted?: (data: ProductEventData) => void,
    onAvailabilityChanged?: (data: ProductEventData) => void
  ) => {
    useEffect(() => {
      const cleanups: (() => void)[] = [];

      if (onCreated) {
        const cleanup = onProductCreated(onCreated);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      if (onUpdated) {
        const cleanup = onProductUpdated(onUpdated);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      if (onDeleted) {
        const cleanup = onProductDeleted(onDeleted);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      if (onAvailabilityChanged) {
        const cleanup = onProductAvailabilityChanged(onAvailabilityChanged);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      return () => {
        cleanups.forEach(cleanup => cleanup());
      };
    }, [onCreated, onUpdated, onDeleted, onAvailabilityChanged]);
  }, []);

  /* =========================================================
     RECIPE EVENTS
  ========================================================= */
  const useRecipeEvents = useCallback((
    onCreated?: (data: RecipeEventData) => void,
    onUpdated?: (data: RecipeEventData) => void,
    onDeleted?: (data: RecipeEventData) => void
  ) => {
    useEffect(() => {
      const cleanups: (() => void)[] = [];

      if (onCreated) {
        const cleanup = onRecipeCreated(onCreated);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      if (onUpdated) {
        const cleanup = onRecipeUpdated(onUpdated);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      if (onDeleted) {
        const cleanup = onRecipeDeleted(onDeleted);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      return () => {
        cleanups.forEach(cleanup => cleanup());
      };
    }, [onCreated, onUpdated, onDeleted]);
  }, []);

  /* =========================================================
     INVENTORY EVENTS
  ========================================================= */
  const useInventoryEvents = useCallback((
    onCreated?: (data: InventoryEventData) => void,
    onUpdated?: (data: InventoryEventData) => void,
    onStockChanged?: (data: InventoryEventData) => void
  ) => {
    useEffect(() => {
      const cleanups: (() => void)[] = [];

      if (onCreated) {
        const cleanup = onInventoryCreated(onCreated);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      if (onUpdated) {
        const cleanup = onInventoryUpdated(onUpdated);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      if (onStockChanged) {
        const cleanup = onInventoryStockChanged(onStockChanged);
        cleanups.push(cleanup);
        cleanupFunctionsRef.current.push(cleanup);
      }

      return () => {
        cleanups.forEach(cleanup => cleanup());
      };
    }, [onCreated, onUpdated, onStockChanged]);
  }, []);

  return {
    socket: socketRef.current,
    useMenuEvents,
    useProductEvents,
    useRecipeEvents,
    useInventoryEvents,
  };
};

/* =========================================================
   HOOKS SIMPLIFICADOS PARA EVENTOS ESPECÍFICOS
========================================================= */

export const useMenuSocketEvents = (
  onCreated?: (data: MenuEventData) => void,
  onUpdated?: (data: MenuEventData) => void,
  onDeleted?: (data: MenuEventData) => void
) => {
  const { useMenuEvents } = useSocket();
  useMenuEvents(onCreated, onUpdated, onDeleted);
};

export const useProductSocketEvents = (
  onCreated?: (data: ProductEventData) => void,
  onUpdated?: (data: ProductEventData) => void,
  onDeleted?: (data: ProductEventData) => void,
  onAvailabilityChanged?: (data: ProductEventData) => void
) => {
  const { useProductEvents } = useSocket();
  useProductEvents(onCreated, onUpdated, onDeleted, onAvailabilityChanged);
};

export const useRecipeSocketEvents = (
  onCreated?: (data: RecipeEventData) => void,
  onUpdated?: (data: RecipeEventData) => void,
  onDeleted?: (data: RecipeEventData) => void
) => {
  const { useRecipeEvents } = useSocket();
  useRecipeEvents(onCreated, onUpdated, onDeleted);
};

export const useInventorySocketEvents = (
  onCreated?: (data: InventoryEventData) => void,
  onUpdated?: (data: InventoryEventData) => void,
  onStockChanged?: (data: InventoryEventData) => void
) => {
  const { useInventoryEvents } = useSocket();
  useInventoryEvents(onCreated, onUpdated, onStockChanged);
};
