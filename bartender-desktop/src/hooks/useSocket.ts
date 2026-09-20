import { useEffect } from "react";
import {
  socketService,
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
  getSocket,
} from "../services/socket";
import type { MenuEventData, ProductEventData, RecipeEventData, InventoryEventData } from "../services/socket";
import { getToken } from "../utils/tokenStorage";

type Cleanup = () => void;

function useSocketConnection(): void {
  useEffect(() => {
    if (!getSocket()) socketService.connect(getToken() || undefined);
  }, []);
}


export function useMenuSocketEvents(
  onCreated?: (data: MenuEventData) => void,
  onUpdated?: (data: MenuEventData) => void,
  onDeleted?: (data: MenuEventData) => void,
): void {
  useSocketConnection();
  useEffect(() => {
    const cleanups = [
      onCreated ? onMenuCreated(onCreated) : undefined,
      onUpdated ? onMenuUpdated(onUpdated) : undefined,
      onDeleted ? onMenuDeleted(onDeleted) : undefined,
    ].filter((cleanup): cleanup is Cleanup => Boolean(cleanup));
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [onCreated, onUpdated, onDeleted]);
}

export function useProductSocketEvents(
  onCreated?: (data: ProductEventData) => void,
  onUpdated?: (data: ProductEventData) => void,
  onDeleted?: (data: ProductEventData) => void,
  onAvailabilityChanged?: (data: ProductEventData) => void,
): void {
  useSocketConnection();
  useEffect(() => {
    const cleanups = [
      onCreated ? onProductCreated(onCreated) : undefined,
      onUpdated ? onProductUpdated(onUpdated) : undefined,
      onDeleted ? onProductDeleted(onDeleted) : undefined,
      onAvailabilityChanged ? onProductAvailabilityChanged(onAvailabilityChanged) : undefined,
    ].filter((cleanup): cleanup is Cleanup => Boolean(cleanup));
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [onCreated, onUpdated, onDeleted, onAvailabilityChanged]);
}

export function useRecipeSocketEvents(
  onCreated?: (data: RecipeEventData) => void,
  onUpdated?: (data: RecipeEventData) => void,
  onDeleted?: (data: RecipeEventData) => void,
): void {
  useSocketConnection();
  useEffect(() => {
    const cleanups = [
      onCreated ? onRecipeCreated(onCreated) : undefined,
      onUpdated ? onRecipeUpdated(onUpdated) : undefined,
      onDeleted ? onRecipeDeleted(onDeleted) : undefined,
    ].filter((cleanup): cleanup is Cleanup => Boolean(cleanup));
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [onCreated, onUpdated, onDeleted]);
}

export function useInventorySocketEvents(
  onCreated?: (data: InventoryEventData) => void,
  onUpdated?: (data: InventoryEventData) => void,
  onStockChanged?: (data: InventoryEventData) => void,
): void {
  useSocketConnection();
  useEffect(() => {
    const cleanups = [
      onCreated ? onInventoryCreated(onCreated) : undefined,
      onUpdated ? onInventoryUpdated(onUpdated) : undefined,
      onStockChanged ? onInventoryStockChanged(onStockChanged) : undefined,
    ].filter((cleanup): cleanup is Cleanup => Boolean(cleanup));
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [onCreated, onUpdated, onStockChanged]);
}

/** Compatibilidad para consumidores antiguos que importan useSocket. */
export const useSocket = () => {
  useSocketConnection();
  return { socket: getSocket() };
};
