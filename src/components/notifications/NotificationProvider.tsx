"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { toast, ToastOptions } from "react-hot-toast";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

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

  const showToast = useCallback(
    (type: NotificationType, message: string, options?: ToastOptions) => {
      const defaultOptions: ToastOptions = {
        duration: 4000,
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#fff",
          color: "#333",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          padding: "16px",
          minWidth: "300px",
        },
      };

      const typeStyles: Record<NotificationType, ToastOptions> = {
        success: {
          ...defaultOptions,
          icon: "✅",
          style: {
            ...defaultOptions.style,
            borderLeft: "4px solid #10b981",
          },
        },
        error: {
          ...defaultOptions,
          icon: "❌",
          style: {
            ...defaultOptions.style,
            borderLeft: "4px solid #ef4444",
          },
        },
        warning: {
          ...defaultOptions,
          icon: "⚠️",
          style: {
            ...defaultOptions.style,
            borderLeft: "4px solid #f59e0b",
          },
        },
        info: {
          ...defaultOptions,
          icon: "ℹ️",
          style: {
            ...defaultOptions.style,
            borderLeft: "4px solid #3b82f6",
          },
        },
      };

      toast(message, { ...typeStyles[type], ...options });
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

  if (notifications.length === 0) return null;

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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border shadow-lg ${getBorderColor(
        notification.type
      )} animate-in slide-in-from-right-2 duration-300`}>
      <div className="flex items-start space-x-3">
        {getIcon(notification.type)}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500">
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
