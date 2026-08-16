/**
 * Socket.IO Event Handlers
 * Handles specific business logic for realtime events
 */

import type { OrderStatusEvent, OrderCreatedEvent } from "./types";

/**
 * Handle order status update from server
 */
export function handleOrderStatusEvent(data: OrderStatusEvent): void {
  console.log("[Realtime] Order status update:", data);

  // Emit custom event for UI to listen
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("order:status", { detail: data }));
  }
}

/**
 * Handle order creation from server
 */
export function handleOrderCreatedEvent(data: OrderCreatedEvent): void {
  console.log("[Realtime] Order created:", data);

  // Emit custom event for UI to listen
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("order:created", { detail: data }));
  }
}

/**
 * Register event listener for order status
 */
export function onOrderStatus(callback: (data: OrderStatusEvent) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as any;
    callback(customEvent.detail);
  };

  window.addEventListener("order:status", handler);

  return () => {
    window.removeEventListener("order:status", handler);
  };
}

/**
 * Register event listener for order creation
 */
export function onOrderCreated(callback: (data: OrderCreatedEvent) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as any;
    callback(customEvent.detail);
  };

  window.addEventListener("order:created", handler);

  return () => {
    window.removeEventListener("order:created", handler);
  };
}