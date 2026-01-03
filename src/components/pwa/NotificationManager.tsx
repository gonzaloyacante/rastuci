"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n";
import { useNotifications } from "@/lib/pwa";
import { Bell, BellOff, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface NotificationManagerProps {
  className?: string;
}

export function NotificationManager({
  className = "",
}: NotificationManagerProps) {
  const { permission, requestPermission, showNotification } =
    useNotifications();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    priceDrops: true,
    stockAlerts: true,
    newsletter: false,
  });

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem("notification-preferences");
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const savePreferences = (newPrefs: typeof preferences) => {
    setPreferences(newPrefs);
    localStorage.setItem("notification-preferences", JSON.stringify(newPrefs));
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      toast.success(t("notifications.permission.granted"));
      // Send welcome notification
      await showNotification({
        title: t("notifications.welcome.title"),
        body: t("notifications.welcome.body"),
        tag: "welcome",
      });
    } else {
      toast.error(t("notifications.permission.denied"));
    }
  };

  const handleTestNotification = async () => {
    if (permission !== "granted") {
      toast.error(t("notifications.permission.required"));
      return;
    }

    await showNotification({
      title: t("notifications.test.title"),
      body: t("notifications.test.body"),
      tag: "test",
      actions: [
        {
          action: "view",
          title: t("common.view"),
        },
        {
          action: "dismiss",
          title: t("common.dismiss"),
        },
      ],
    });

    toast.success(t("notifications.test.sent"));
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case "granted":
        return {
          color: "success",
          text: t("notifications.permission.granted"),
        };
      case "denied":
        return { color: "error", text: t("notifications.permission.denied") };
      default:
        return {
          color: "warning",
          text: t("notifications.permission.default"),
        };
    }
  };

  const status = getPermissionStatus();

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {permission === "granted" ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{t("notifications.title")}</span>
        <Badge
          variant={
            status.color as "default" | "secondary" | "destructive" | "outline"
          }
          className="ml-1"
        >
          {status.text}
        </Badge>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 surface border border-muted rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {t("notifications.settings.title")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Permission Status */}
            <div className="mb-4 p-3 rounded-lg border border-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  {t("notifications.permission.title")}
                </span>
                <Badge
                  variant={
                    status.color as
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                  }
                >
                  {status.text}
                </Badge>
              </div>

              {permission === "default" && (
                <Button onClick={handleRequestPermission} className="w-full">
                  {t("notifications.permission.request")}
                </Button>
              )}

              {permission === "granted" && (
                <Button
                  variant="outline"
                  onClick={handleTestNotification}
                  className="w-full"
                >
                  {t("notifications.test.button")}
                </Button>
              )}

              {permission === "denied" && (
                <p className="text-sm text-muted">
                  {t("notifications.permission.deniedHelp")}
                </p>
              )}
            </div>

            {/* Notification Preferences */}
            {permission === "granted" && (
              <div className="space-y-3">
                <h4 className="font-medium">
                  {t("notifications.preferences.title")}
                </h4>

                {Object.entries(preferences).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">
                      {t(`notifications.types.${key}`)}
                    </span>
                    <button
                      onClick={() =>
                        savePreferences({ ...preferences, [key]: !enabled })
                      }
                      className={`
                        w-10 h-6 rounded-full transition-colors relative
                        ${enabled ? "bg-primary" : "bg-muted"}
                      `}
                    >
                      <div
                        className={`
                        w-4 h-4 bg-white rounded-full absolute top-1 transition-transform
                        ${enabled ? "translate-x-5" : "translate-x-1"}
                      `}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          role="button"
          tabIndex={0}
          aria-label="Cerrar notificaciones"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsOpen(false);
            }
          }}
        />
      )}
    </div>
  );
}

// Notification permission prompt
export function NotificationPrompt({ onDismiss }: { onDismiss?: () => void }) {
  const { permission, requestPermission } = useNotifications();
  const { t } = useTranslation();

  if (permission !== "default") {
    return null;
  }

  const handleAllow = async () => {
    await requestPermission();
    onDismiss?.();
  };

  return (
    <div className="surface border border-muted rounded-lg p-4 flex items-start gap-3">
      <Bell className="w-5 h-5 text-primary mt-0.5" />
      <div className="flex-1">
        <h3 className="font-medium mb-1">{t("notifications.prompt.title")}</h3>
        <p className="text-sm text-muted mb-3">
          {t("notifications.prompt.description")}
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAllow}>
            <Check className="w-3 h-3 mr-1" />
            {t("notifications.prompt.allow")}
          </Button>
          <Button variant="outline" size="sm" onClick={onDismiss}>
            {t("notifications.prompt.later")}
          </Button>
        </div>
      </div>
      {onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
