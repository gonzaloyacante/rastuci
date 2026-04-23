"use client";

import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useOfflineIndicator } from "@/hooks/useOfflineIndicator";
import { usePWA } from "@/lib/pwa";

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
  const { isOnline, isRetrying, handleRetry } = useOfflineIndicator();

  if (isOnline) return null;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-50 ${
        position === "top" ? "top-4" : "bottom-4"
      } ${className}`}
    >
      <div className="surface border border-muted rounded-lg shadow-lg p-3 flex items-center gap-3 max-w-sm">
        <WifiOff className="w-5 h-5 text-error" />
        <div className="flex-1">
          <p className="text-sm font-medium">Sin conexión</p>
          <p className="text-xs text-muted">Verificá tu conexión a internet</p>
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
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}

export function NetworkStatus({ className = "" }: { className?: string }) {
  const { isOnline } = usePWA();

  return (
    <Badge
      variant={isOnline ? "success" : "error"}
      className={`flex items-center gap-1 ${className}`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          En línea
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Sin conexión
        </>
      )}
    </Badge>
  );
}

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

  if (isOnline) return null;

  return (
    <div
      className={`bg-warning/10 border border-warning rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-warning">
            {message ?? "Acción no disponible sin conexión"}
          </p>
          <p className="text-sm text-muted mt-1">
            Esta acción requiere conexión a internet. Verificá tu conexión e
            intentá de nuevo.
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
