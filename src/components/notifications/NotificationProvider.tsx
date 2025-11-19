"use client";

import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import React, { createContext, useCallback, useContext, useState } from "react";
import { toast, ToastOptions } from "react-hot-toast";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  showToast: (
    type: NotificationType,
    message: string,
    options?: ToastOptions
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification = { ...notification, id };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          removeNotification(id);
        }, notification.duration || 5000);
      }
    },
    [removeNotification]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showToast = useCallback(
    (type: NotificationType, message: string, options?: ToastOptions) => {
      const base: ToastOptions = {
        duration: 4000,
        position: "top-center",
        className:
          "surface border border-muted text-primary rounded-xl shadow-md px-4 py-3 min-w-[280px]",
      };

      const byType: Record<NotificationType, ToastOptions> = {
        success: {
          ...base,
          icon: "✅",
          className: `${base.className} border-success`,
        },
        error: {
          ...base,
          icon: "❌",
          className: `${base.className} border-error`,
        },
        warning: {
          ...base,
          icon: "⚠️",
          className: `${base.className} border-warning`,
        },
        info: {
          ...base,
          icon: "ℹ️",
          className: `${base.className} border-info`,
        },
      };

      toast(message, { ...byType[type], ...options });
    },
    []
  );

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Componente para mostrar notificaciones persistentes
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
}) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "error":
        return <XCircle className="w-5 h-5 text-error" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case "info":
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-success surface";
      case "error":
        return "border-error surface";
      case "warning":
        return "border-warning surface";
      case "info":
        return "border-info surface";
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border shadow-lg ${getBorderColor(
        notification.type
      )} animate-in slide-in-from-right-2 duration-300`}
    >
      <div className="flex items-start space-x-3">
        {getIcon(notification.type)}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-primary">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="mt-1 text-sm muted">{notification.message}</p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-primary hover:opacity-90"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onRemove}
          className="shrink-0 muted hover:text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
