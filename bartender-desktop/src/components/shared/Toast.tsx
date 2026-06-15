"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

const toastIcons = {
  success: <CheckCircle size={20} className="text-emerald-400" />,
  error: <AlertCircle size={20} className="text-red" />,
  warning: <AlertTriangle size={20} className="text-gold" />,
  info: <Info size={20} className="text-cyan-400" />,
};

const toastStyles = {
  success: "border-emerald-400/30 bg-emerald-400/10",
  error: "border-red/30 bg-red/10",
  warning: "border-gold/30 bg-gold/10",
  info: "border-cyan-400/30 bg-cyan-400/10",
};

export default function Toast({ id, type, message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${toastStyles[type]} shadow-lg backdrop-blur-sm animate-slide-in-right`}
      role="alert"
    >
      {toastIcons[type]}
      <p className="text-sm font-medium text-ivory flex-1">{message}</p>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="text-muted hover:text-ivory p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
}
