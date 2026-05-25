"use client";

import { useState, useCallback } from "react";
import type { Toast, ToastType } from "../components/ToastNotification";

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message: string, duration?: number) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = {
        id,
        type,
        title,
        message,
        duration,
      };
      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("success", title, message, duration);
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("error", title, message, duration);
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("info", title, message, duration);
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("warning", title, message, duration);
    },
    [addToast]
  );

  const confirm = useCallback(
    (title: string, message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const id = addToast("info", title, message);
        
        // Create a custom confirm dialog with toast
        const confirmToastId = Math.random().toString(36).substring(7);
        setToasts((prev) => [
          ...prev,
          {
            id: confirmToastId,
            type: "info",
            title: title,
            message: `${message}\n\n[CONFIRM] Si para cancelar, [ENTER] para confirmar`,
            duration: 0, // Don't auto-dismiss
          },
        ]);

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Enter") {
            removeToast(confirmToastId);
            removeToast(id);
            resolve(true);
            window.removeEventListener("keydown", handleKeyDown);
          } else if (e.key === "Escape") {
            removeToast(confirmToastId);
            removeToast(id);
            resolve(false);
            window.removeEventListener("keydown", handleKeyDown);
          }
        };

        window.addEventListener("keydown", handleKeyDown);
      });
    },
    [addToast, removeToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    confirm,
  };
}
