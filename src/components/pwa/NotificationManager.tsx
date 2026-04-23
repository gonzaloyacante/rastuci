"use client";

import { Bell, BellOff, Check, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useNotifications } from "@/lib/pwa";

const PREFERENCE_LABELS: Record<string, string> = {
  orderUpdates: "Actualizaciones de pedidos",
  promotions: "Promociones",
  newProducts: "Nuevos productos",
  priceDrops: "Bajas de precio",
  stockAlerts: "Alertas de stock",
  newsletter: "Novedades",
};

interface NotificationManagerProps {
  className?: string;
}

export function NotificationManager({
  className = "",
}: NotificationManagerProps) {
  const {
    permission,
    preferences,
    permissionStatus,
    handleRequestPermission,
    handleTestNotification,
    savePreferences,
  } = useNotificationManager();
  const [isOpen, setIsOpen] = useState(false);

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
        <span className="hidden sm:inline">Notificaciones</span>
        <Badge
          variant={
            permissionStatus.color as
              | "default"
              | "secondary"
              | "destructive"
              | "outline"
          }
          className="ml-1"
        >
          {permissionStatus.text}
        </Badge>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 surface border border-muted rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Configuración de Notificaciones</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4 p-3 rounded-lg border border-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Permisos</span>
                <Badge
                  variant={
                    permissionStatus.color as
                      | "default"
                      | "secondary"
                      | "destructive"
                      | "outline"
                  }
                >
                  {permissionStatus.text}
                </Badge>
              </div>

              {permission === "default" && (
                <Button onClick={handleRequestPermission} className="w-full">
                  Activar notificaciones
                </Button>
              )}

              {permission === "granted" && (
                <Button
                  variant="outline"
                  onClick={handleTestNotification}
                  className="w-full"
                >
                  Enviar prueba
                </Button>
              )}

              {permission === "denied" && (
                <p className="text-sm text-muted">
                  Para activarlas, cambiá los permisos desde la configuración de
                  tu navegador
                </p>
              )}
            </div>

            {permission === "granted" && (
              <div className="space-y-3">
                <h4 className="font-medium">Mis preferencias</h4>
                {Object.entries(preferences).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">
                      {PREFERENCE_LABELS[key] ?? key}
                    </span>
                    <button
                      onClick={() =>
                        savePreferences({ ...preferences, [key]: !enabled })
                      }
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        enabled ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          role="button"
          tabIndex={0}
          aria-label="Cerrar notificaciones"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}

export function NotificationPrompt({ onDismiss }: { onDismiss?: () => void }) {
  const { permission, requestPermission } = useNotifications();

  if (permission !== "default") return null;

  const handleAllow = async () => {
    await requestPermission();
    onDismiss?.();
  };

  return (
    <div className="surface border border-muted rounded-lg p-4 flex items-start gap-3">
      <Bell className="w-5 h-5 text-primary mt-0.5" />
      <div className="flex-1">
        <h3 className="font-medium mb-1">¿Querés recibir notificaciones?</h3>
        <p className="text-sm text-muted mb-3">
          Activá las notificaciones para recibir actualizaciones de tus pedidos
          y ofertas especiales
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAllow}>
            <Check className="w-3 h-3 mr-1" />
            Activar
          </Button>
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Ahora no
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
