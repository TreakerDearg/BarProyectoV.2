"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import clsx from "clsx";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  toasts: Toast[];
  show: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: AlertCircle,
  warning: AlertTriangle,
};

const TOAST_STYLES = {
  success: "border-green-border bg-green-soft text-green-light",
  error: "border-red-border bg-red-soft text-red-light",
  info: "border-gold-border bg-gold-soft text-gold-light",
  warning: "border-orange-border bg-orange-soft text-orange-light",
};

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = Math.random().toString(36).slice(2, 9);
      const toast: Toast = {
        id,
        message,
        type,
        duration: duration ?? DEFAULT_DURATION,
      };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      show,
      dismiss,
      clear,
    }),
    [toasts, show, dismiss, clear],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const Icon = TOAST_ICONS[toast.type];
  const style = TOAST_STYLES[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm",
        "shadow-lg min-w-[280px] max-w-[400px] pointer-events-auto",
        style,
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}