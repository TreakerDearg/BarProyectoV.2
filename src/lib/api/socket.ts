import { io } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") 
  : "http://localhost:5000";

const socket = io(socketUrl, {
  withCredentials: true,
  autoConnect: true,
  
  // Reconnection configuration
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  
  // Timeout configuration
  timeout: 20000,
  
  // Transports
  transports: ["websocket", "polling"],
  
  // Force new connection on refresh
  forceNew: false,
});

// Connection status monitoring
socket.on("connect", () => {
  console.log("[Socket] Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("[Socket] Disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("[Socket] Connection error:", error.message);
});

export default socket;
