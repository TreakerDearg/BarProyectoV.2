"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-emerald" />,
    error: <AlertCircle size={18} className="text-red" />,
    info: <Info size={18} className="text-[#388BFD]" />,
    warning: <AlertTriangle size={18} className="text-gold" />,
  };

  const colors = {
    success: "border-emerald/30 bg-surface-3 text-emerald",
    error: "border-red/30 bg-surface-3 text-red",
    info: "border-[#388BFD]/30 bg-surface-3 text-[#388BFD]",
    warning: "border-gold/30 bg-surface-3 text-gold",
  };

  return (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 ${
        colors[toast.type]
      } ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}`}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black text-ivory uppercase tracking-wider mb-1">
          {toast.title}
        </h4>
        <p className="text-xs text-muted leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className="shrink-0 p-1 rounded-lg hover:bg-surface-4 text-muted hover:text-ivory transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
