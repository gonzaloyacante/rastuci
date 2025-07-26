"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "react-hot-toast";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  createdAt: Date;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  success: (message: string, options?: Partial<Notification>) => void;
  error: (message: string, options?: Partial<Notification>) => void;
  warning: (message: string, options?: Partial<Notification>) => void;
  info: (message: string, options?: Partial<Notification>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "createdAt">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = {
        ...notification,
        id,
        createdAt: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // También usar react-hot-toast para notificaciones toast
      switch (notification.type) {
        case "success":
          toast.success(notification.message);
          break;
        case "error":
          toast.error(notification.message);
          break;
        case "warning":
          toast(notification.message, { icon: "⚠️" });
          break;
        case "info":
          toast(notification.message, { icon: "ℹ️" });
          break;
      }

      // Auto-remove después de la duración especificada
      if (notification.duration !== 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, notification.duration || 5000);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = useCallback(
    (message: string, options?: Partial<Notification>) => {
      addNotification({ ...options, type: "success", message });
    },
    [addNotification]
  );

  const error = useCallback(
    (message: string, options?: Partial<Notification>) => {
      addNotification({ ...options, type: "error", message });
    },
    [addNotification]
  );

  const warning = useCallback(
    (message: string, options?: Partial<Notification>) => {
      addNotification({ ...options, type: "warning", message });
    },
    [addNotification]
  );

  const info = useCallback(
    (message: string, options?: Partial<Notification>) => {
      addNotification({ ...options, type: "info", message });
    },
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
