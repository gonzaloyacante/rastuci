"use client";

import { useEffect, useState } from "react";

import { usePWA } from "@/lib/pwa";

export function usePWAInstall(autoShow = true) {
  const { canInstall, promptInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) setIsDismissed(true);
  }, []);

  useEffect(() => {
    if (autoShow && canInstall && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [canInstall, autoShow, isDismissed]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    try {
      localStorage.setItem("pwa-install-dismissed", "true");
    } catch {
      /* noop — QuotaExceededError */
    }
  };

  return {
    canInstall,
    isVisible,
    isDismissed,
    handleInstall,
    handleDismiss,
  };
}
