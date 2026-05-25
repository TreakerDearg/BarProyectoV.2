"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import socket from "@/lib/api/socket";
import { useClienteStore } from "@/stores/useClienteStore";

interface RouletteResult {
  result: {
    _id: string;
    name: string;
    rarity: string;
    category: string;
    probability: number;
  };
  meta: {
    pityTriggered?: boolean;
    pityTarget?: string;
  };
}

export function useRouletteSocket() {
  const [notification, setNotification] = useState<RouletteResult | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<"good" | "poor" | "offline">("offline");
  
  const token = useClienteStore((s) => s.token);
  const user = useClienteStore((s) => s.user);
  
  // Offline message queue
  const messageQueueRef = useRef<Array<{ event: string; data: Record<string, unknown> }>>([]);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayRef = useRef(1000);

  const showRouletteNotification = useCallback((result: RouletteResult) => {
    setNotification(result);
    setShowNotification(true);
    
    // Auto-hide después de 5 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  }, []);

  // Process queued messages when reconnected
  const processMessageQueue = useCallback(() => {
    while (messageQueueRef.current.length > 0) {
      const message = messageQueueRef.current.shift();
      if (message && isConnected) {
        socket.emit(message.event, message.data);
      }
    }
  }, [isConnected]);

  // Exponential backoff for reconnection
  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      const delay = reconnectDelayRef.current * 2;
      reconnectDelayRef.current = Math.min(delay, 30000); // Max 30s
      
      setTimeout(() => {
        reconnectAttemptsRef.current++;
        socket.connect();
      }, reconnectDelayRef.current);
    }
  }, []);

  useEffect(() => {
    if (!token || !user?._id) return;

    // Connection state listeners
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionQuality("good");
      reconnectAttemptsRef.current = 0;
      reconnectDelayRef.current = 1000;
      
      // Re-join rooms
      socket.emit("join:user", user._id);
      socket.emit("join:roulette");
      
      // Process queued messages
      processMessageQueue();
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      setConnectionQuality("offline");
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === "io server disconnect" || reason === "ping timeout") {
        handleReconnect();
      }
    };

    const handleError = (error: Error) => {
      console.error("[Socket] Error:", error);
      setConnectionQuality("poor");
    };

    // Register listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);

    // Initial connection check
    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    // Join rooms
    socket.emit("join:user", user._id);
    socket.emit("join:roulette");

    // Escuchar resultado personal
    socket.on("roulette:result", (result: RouletteResult) => {
      showRouletteNotification(result);
    });

    // Escutar resultados globales (para otros usuarios)
    socket.on("roulette:spin", (result: RouletteResult) => {
      // Solo mostrar si no es el usuario actual (ya recibió el personal)
      // Esto es opcional, dependiendo de si quieres mostrar activity global
      console.log("Alguien ganó en la ruleta:", result.result.name);
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.emit("leave:user", user._id);
      socket.off("roulette:result");
      socket.off("roulette:spin");
    };
  }, [token, user?._id, showRouletteNotification, handleReconnect, processMessageQueue]);

  const dismissNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  // Manual reconnection trigger
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    reconnectDelayRef.current = 1000;
    socket.connect();
  }, []);

  return {
    notification,
    showNotification,
    dismissNotification,
    isConnected,
    connectionQuality,
    reconnect,
  };
}
