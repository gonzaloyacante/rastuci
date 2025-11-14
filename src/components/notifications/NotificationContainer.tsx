import React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useNotifications, Notification } from "@/context/NotificationContext";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const { removeNotification } = useNotifications();

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-error" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "info":
        return <Info className="w-5 h-5 text-info" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case "success":
        return "border-success";
      case "error":
        return "border-error";
      case "warning":
        return "border-warning";
      case "info":
        return "border-info";
      default:
        return "border-muted";
    }
  };

  return (
    <div
      className={`surface border ${getBorderColor()} rounded-lg shadow-lg p-4 mb-3 max-w-sm`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          {notification.title && (
            <h3 className="text-sm font-medium text-primary mb-1">
              {notification.title}
            </h3>
          )}
          <p className="text-sm muted">
            {notification.message}
          </p>
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {notification.actions.map((action) => (
                <button
                  key={`action-${action.label}-${Math.random()}`}
                  onClick={action.onClick}
                  className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                    action.variant === "primary"
                      ? "bg-primary text-white hover:brightness-95"
                      : action.variant === "secondary"
                      ? "surface-secondary text-primary hover:brightness-95"
                      : "border border-muted text-primary hover:brightness-95"
                  }`}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => removeNotification(notification.id)}
          className="flex-shrink-0 ml-3 muted hover:text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export const NotificationContainer: React.FC = () => {
  const { notifications } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
