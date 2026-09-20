import { createContext, useContext } from "react";
import type { Notification } from "./notificationTypes";

export interface NotificationCenterContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  isPanelOpen: boolean;
  togglePanel: () => void;
  closePanel: () => void;
}

export const NotificationCenterContext = createContext<NotificationCenterContextType | null>(null);

export function useNotifications(): NotificationCenterContextType {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationCenterProvider");
  }
  return context;
}

export function useNotificationBell() {
  const { notifications, isPanelOpen, togglePanel, closePanel } = useNotifications();
  return {
    isOpen: isPanelOpen,
    toggle: togglePanel,
    close: closePanel,
    unreadCount: notifications.length,
  };
}
