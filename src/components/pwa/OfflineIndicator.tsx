"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n";
import { usePWA } from "@/lib/pwa";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface OfflineIndicatorProps {
  className?: string;
  showRetry?: boolean;
  position?: "top" | "bottom";
}

export function OfflineIndicator({
  className = "",
  showRetry = true,
  position = "top",
}: OfflineIndicatorProps) {
  const { isOnline } = usePWA();
  const { t } = useTranslation();
  const [wasOffline, setWasOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      toast.error(t("pwa.offline.message"), {
        duration: 5000,
        icon: <WifiOff className="w-4 h-4" />,
      });
    } else if (wasOffline) {
      toast.success(t("pwa.online.message"), {
        duration: 3000,
        icon: <Wifi className="w-4 h-4" />,
      });
      setWasOffline(false);
    }
  }, [isOnline, wasOffline, t]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Try to fetch a simple endpoint to test connectivity
      await fetch("/api/health", { cache: "no-cache" });
      toast.success(t("pwa.retry.success"));
    } catch {
      toast.error(t("pwa.retry.failed"));
    } finally {
      setIsRetrying(false);
    }
  };

  if (isOnline) {
    return null;
  }

  return (
    <div
      className={`
      fixed left-1/2 transform -translate-x-1/2 z-50
      ${position === "top" ? "top-4" : "bottom-4"}
      ${className}
    `}
    >
      <div className="surface border border-muted rounded-lg shadow-lg p-3 flex items-center gap-3 max-w-sm">
        <WifiOff className="w-5 h-5 text-error" />
        <div className="flex-1">
          <p className="text-sm font-medium">{t("pwa.offline.title")}</p>
          <p className="text-xs text-muted">{t("pwa.offline.description")}</p>
        </div>
        {showRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-1"
          >
            <RefreshCw
              className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`}
            />
            {t("pwa.retry.button")}
          </Button>
        )}
      </div>
    </div>
  );
}

// Network status badge for header
export function NetworkStatus({ className = "" }: { className?: string }) {
  const { isOnline } = usePWA();
  const { t } = useTranslation();

  return (
    <Badge
      variant={isOnline ? "success" : "error"}
      className={`flex items-center gap-1 ${className}`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          {t("pwa.status.online")}
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          {t("pwa.status.offline")}
        </>
      )}
    </Badge>
  );
}

// Offline banner for critical actions
export function OfflineBanner({
  message,
  action,
  onAction,
  className = "",
}: {
  message?: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}) {
  const { isOnline } = usePWA();
  const { t } = useTranslation();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className={`bg-warning/10 border border-warning rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-warning">
            {message || t("pwa.offline.actionBlocked")}
          </p>
          <p className="text-sm text-muted mt-1">
            {t("pwa.offline.actionDescription")}
          </p>
        </div>
        {action && onAction && (
          <Button variant="outline" size="sm" onClick={onAction}>
            {action}
          </Button>
        )}
      </div>
    </div>
  );
}
