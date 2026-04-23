"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import { useNotifications } from "@/lib/pwa";

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
  stockAlerts: boolean;
  newsletter: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  promotions: false,
  newProducts: true,
  priceDrops: true,
  stockAlerts: true,
  newsletter: false,
};

const STORAGE_KEY = "notification-preferences";

export function useNotificationManager() {
  const { permission, requestPermission, showNotification } =
    useNotifications();
  const { show } = useToast();
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved) as NotificationPreferences);
      }
    } catch {
      // noop — use defaults if stored preferences are corrupted
    }
  }, []);

  const savePreferences = (newPrefs: NotificationPreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch {
      // noop — QuotaExceededError possible in iOS private mode
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      show({ type: "success", message: "Notificaciones activadas" });
      await showNotification({
        title: "¡Bienvenido a Rastuci!",
        body: "Recibirás actualizaciones de tus pedidos y novedades",
        tag: "welcome",
      });
    } else {
      show({ type: "error", message: "Notificaciones bloqueadas" });
    }
  };

  const handleTestNotification = async () => {
    if (permission !== "granted") {
      show({ type: "error", message: "Primero activá las notificaciones" });
      return;
    }
    await showNotification({
      title: "Notificación de prueba",
      body: "Las notificaciones están funcionando correctamente",
      tag: "test",
      actions: [
        { action: "view", title: "Ver" },
        { action: "dismiss", title: "Descartar" },
      ],
    });
    show({ type: "success", message: "Notificación de prueba enviada" });
  };

  const getPermissionStatus = (): {
    color: "success" | "error" | "warning";
    text: string;
  } => {
    switch (permission) {
      case "granted":
        return { color: "success", text: "Activadas" };
      case "denied":
        return { color: "error", text: "Bloqueadas" };
      default:
        return { color: "warning", text: "Pendiente" };
    }
  };

  return {
    permission,
    preferences,
    permissionStatus: getPermissionStatus(),
    handleRequestPermission,
    handleTestNotification,
    savePreferences,
  };
}
