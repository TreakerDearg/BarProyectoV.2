/**
 * Hook for handling Socket.IO reconnection and state synchronization.
 *
 * IMPORTANTE: Los clientes NO se unen a orders:global (staff only).
 * Al reconectar se unen a user:{userId} para recibir actualizaciones
 * de sus propios pedidos en tiempo real.
 */

import { useEffect, useCallback } from "react";
import { useClienteStore } from "@/stores/useClienteStore";
import { joinUserRoom, isConnected } from "@/lib/realtime/socket";

export function useSocketReconnection() {
  const userId = useClienteStore((state) => state.user?._id);

  useEffect(() => {
    const handleReconnect = () => {
      if (userId) {
        joinUserRoom(userId);
      }
    };

    const handleDisconnect = () => {
      // Los componentes que escuchan este evento pueden activar polling
    };

    const handleFallback = () => {
      // Max reconnect intentos — componentes pueden activar polling
    };

    window.addEventListener("socket:reconnected", handleReconnect);
    window.addEventListener("socket:disconnect",  handleDisconnect);
    window.addEventListener("socket:fallback",    handleFallback);

    return () => {
      window.removeEventListener("socket:reconnected", handleReconnect);
      window.removeEventListener("socket:disconnect",  handleDisconnect);
      window.removeEventListener("socket:fallback",    handleFallback);
    };
  }, [userId]);

  const triggerStateSync = useCallback(() => {
    window.dispatchEvent(new CustomEvent("socket:state-sync"));
  }, []);

  const checkConnection = useCallback(() => isConnected(), []);

  return { triggerStateSync, checkConnection };
}
