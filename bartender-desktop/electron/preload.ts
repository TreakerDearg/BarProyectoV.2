import { contextBridge, ipcRenderer } from "electron";

/**
 * API segura expuesta al frontend
 */
contextBridge.exposeInMainWorld("electronAPI", {
  // =============================
  // INFO DEL SISTEMA
  // =============================
  system: {
    platform: process.platform,
    versions: {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
    },
  },

  // =============================
  // IPC (comunicación segura)
  // =============================
  ipc: {
    send: (channel: string, data?: unknown) => {
      const validChannels = ["app:quit", "log:message"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },

    invoke: (channel: string, data?: unknown) => {
      const validChannels = ["get:appVersion", "get:data"];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      return Promise.reject(new Error("Canal no permitido"));
    },

    on: (channel: string, callback: (...args: any[]) => void) => {
      const validChannels = ["from:main"];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_, ...args) => callback(...args));
      }
    },

    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },

  // =============================
  // UTILIDADES
  // =============================
  utils: {
    log: (message: string) => {
      ipcRenderer.send("log:message", message);
    },
  },
});