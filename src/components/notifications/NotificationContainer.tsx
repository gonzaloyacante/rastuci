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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case "success":
        return "border-l-green-500";
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-yellow-500";
      case "info":
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div
      className={`bg-white border-l-4 ${getBorderColor()} rounded-lg shadow-lg p-4 mb-3 max-w-sm`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          {notification.title && (
            <h3 className="text-sm font-medium text-content-primary mb-1">
              {notification.title}
            </h3>
          )}
          <p className="text-sm text-content-secondary">
            {notification.message}
          </p>
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                    action.variant === "primary"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : action.variant === "secondary"
                      ? "bg-surface-secondary text-content-primary hover:bg-surface-tertiary"
                      : "border border-border text-content-secondary hover:bg-surface-secondary"
                  }`}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => removeNotification(notification.id)}
          className="flex-shrink-0 ml-3 text-content-secondary hover:text-content-primary">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

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
