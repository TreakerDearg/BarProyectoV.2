"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  ChevronRight,
  Trash2
} from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationCenterContext = createContext<NotificationCenterContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationCenterProvider");
  }
  return context;
}

export function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationCenterContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationCenterUI
        notifications={notifications}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onClose={() => setIsOpen(false)}
        onRemove={removeNotification}
        onClearAll={clearAll}
        unreadCount={unreadCount}
        setUnreadCount={setUnreadCount}
      />
    </NotificationCenterContext.Provider>
  );
}

interface NotificationCenterUIProps {
  notifications: Notification[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

function NotificationCenterUI({
  notifications,
  isOpen,
  onToggle,
  onClose,
  onRemove,
  onClearAll,
  unreadCount,
  setUnreadCount
}: NotificationCenterUIProps) {
  // Mark as read when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen, setUnreadCount]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-emerald-400" />;
      case "error":
        return <XCircle size={20} className="text-red-400" />;
      case "warning":
        return <AlertTriangle size={20} className="text-amber-400" />;
      case "info":
        return <Info size={20} className="text-cyan-400" />;
    }
  };

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 bg-emerald-500/5";
      case "error":
        return "border-red-500/30 bg-red-500/5";
      case "warning":
        return "border-amber-500/30 bg-amber-500/5";
      case "info":
        return "border-cyan-500/30 bg-cyan-500/5";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} d`;
  };

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={onToggle}
        className="relative p-3 bg-surface-3/30 border border-white/5 rounded-2xl hover:bg-surface-3/50 hover:border-white/10 transition-all"
      >
        <Bell size={20} className="text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-2 border-l border-white/5 z-[201] shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-ivory">Notificaciones</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X size={20} className="text-muted" />
                  </button>
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Limpiar todas</span>
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Bell size={48} className="text-muted/30 mb-4" />
                    <p className="text-sm text-muted">No hay notificaciones</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-2xl border ${getNotificationStyles(notification.type)} transition-all`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-ivory">{notification.title}</h3>
                            <button
                              onClick={() => onRemove(notification.id)}
                              className="flex-shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <X size={14} className="text-muted/50 hover:text-muted" />
                            </button>
                          </div>
                          <p className="text-xs text-muted mt-1">{notification.message}</p>
                          <p className="text-[10px] text-muted/50 mt-2">{formatTime(notification.timestamp)}</p>
                          {notification.action && (
                            <button
                              onClick={notification.action.onClick}
                              className="mt-3 flex items-center gap-1 text-xs font-semibold text-gold hover:text-gold/80 transition-colors"
                            >
                              {notification.action.label}
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Toast Notification Component for inline notifications
export function ToastNotification({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} className="text-emerald-400" />;
      case "error":
        return <XCircle size={18} className="text-red-400" />;
      case "warning":
        return <AlertTriangle size={18} className="text-amber-400" />;
      case "info":
        return <Info size={18} className="text-cyan-400" />;
    }
  };

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 bg-emerald-500/10";
      case "error":
        return "border-red-500/30 bg-red-500/10";
      case "warning":
        return "border-amber-500/30 bg-amber-500/10";
      case "info":
        return "border-cyan-500/30 bg-cyan-500/10";
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${getNotificationStyles(notification.type)} shadow-lg animate-slide-in`}>
      {getNotificationIcon(notification.type)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ivory">{notification.title}</p>
        <p className="text-xs text-muted">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors"
      >
        <X size={16} className="text-muted/50 hover:text-muted" />
      </button>
    </div>
  );
}
