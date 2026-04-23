"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import { usePWA } from "@/lib/pwa";

export function useOfflineIndicator() {
  const { isOnline } = usePWA();
  const { show } = useToast();
  const [wasOffline, setWasOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      show({
        type: "error",
        message: "Sin conexión a internet",
        duration: 5000,
      });
    } else if (wasOffline) {
      show({ type: "success", message: "Conexión restaurada", duration: 3000 });
      setWasOffline(false);
    }
  }, [isOnline, wasOffline, show]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await fetch("/api/health", { cache: "no-cache" });
      show({ type: "success", message: "Conexión verificada correctamente" });
    } catch {
      show({
        type: "error",
        message: "Sin conexión. Intentá de nuevo más tarde",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return { isOnline, isRetrying, handleRetry };
}
