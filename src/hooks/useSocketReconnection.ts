/**
 * Hook for handling Socket.IO reconnection and state synchronization
 * Based on REALTIME_CONTRACT.md reconnection strategy
 */

import { useEffect, useCallback } from "react";
import { useClienteStore } from "@/stores/useClienteStore";
import { joinUserRoom, joinOrdersGlobal, isConnected } from "@/lib/realtime/socket";

/**
 * Custom hook to handle socket reconnection and state sync
 * Automatically rejoins rooms and triggers state refresh on reconnection
 */
export function useSocketReconnection() {
  const user = useClienteStore((state) => state.user);

  useEffect(() => {
    // Handle reconnection event
    const handleReconnect = () => {
      console.log("[Reconnection] Socket reconnected, rejoining rooms...");
      
      // Re-join orders global room
      joinOrdersGlobal();
      
      // Re-join user room if authenticated
      if (user?._id) {
        joinUserRoom(user._id);
      }

      // Emit custom event for components to sync their state
      window.dispatchEvent(new CustomEvent("socket:state-sync"));
    };

    // Handle disconnect event (fallback to polling)
    const handleDisconnect = () => {
      console.log("[Reconnection] Socket disconnected, components should enable polling");
    };

    // Handle fallback event (max reconnection attempts reached)
    const handleFallback = () => {
      console.log("[Reconnection] Switching to polling fallback mode");
    };

    window.addEventListener("socket:reconnected", handleReconnect);
    window.addEventListener("socket:disconnect", handleDisconnect);
    window.addEventListener("socket:fallback", handleFallback);

    return () => {
      window.removeEventListener("socket:reconnected", handleReconnect);
      window.removeEventListener("socket:disconnect", handleDisconnect);
      window.removeEventListener("socket:fallback", handleFallback);
    };
  }, [user]);

  /**
   * Manual trigger for state synchronization
   * Call this when you want to refresh data after reconnection
   */
  const triggerStateSync = useCallback(() => {
    window.dispatchEvent(new CustomEvent("socket:state-sync"));
  }, []);

  /**
   * Check if socket is currently connected
   */
  const checkConnection = useCallback(() => {
    return isConnected();
  }, []);

  return {
    triggerStateSync,
    checkConnection,
  };
}