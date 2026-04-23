"use client";

import { Bell, Download, Smartphone, Wifi, X, Zap } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Más rápida",
    description: "Carga instantánea, sin esperas",
  },
  {
    icon: <Wifi className="w-5 h-5" />,
    title: "Sin conexión",
    description: "Accedé al contenido aunque no tengas internet",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Notificaciones",
    description: "Enteráte del estado de tus pedidos en tiempo real",
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: "Experiencia nativa",
    description: "Como una app instalada en tu dispositivo",
  },
];

interface PWAInstallPromptProps {
  className?: string;
  variant?: "banner" | "modal" | "card";
  autoShow?: boolean;
  showFeatures?: boolean;
}

export function PWAInstallPrompt({
  className = "",
  variant = "banner",
  autoShow = true,
  showFeatures = true,
}: PWAInstallPromptProps) {
  const { canInstall, isVisible, isDismissed, handleInstall, handleDismiss } =
    usePWAInstall(autoShow);

  if (!canInstall || isDismissed || !isVisible) return null;

  if (variant === "banner") {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        } ${className}`}
      >
        <div className="surface border-t border-muted p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Instalá la app de Rastuci</h3>
                <p className="text-sm text-muted">
                  Rápida, fácil y sin necesidad de descargas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                Cancelar
              </Button>
              <Button
                onClick={handleInstall}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Instalar app
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "modal") {
    return (
      <div
        className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${className}`}
      >
        <div className="surface rounded-lg max-w-md w-full p-6 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-4 right-4"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              Instalá la app de Rastuci
            </h2>
            <p className="text-muted">
              Accedé a Rastuci como una app nativa desde tu pantalla de inicio
            </p>
          </div>
          {showFeatures && (
            <div className="space-y-3 mb-6">
              {FEATURES.map((feature) => (
                <div
                  key={`feature-${feature.title}`}
                  className="flex items-start gap-3"
                >
                  <div className="text-primary mt-0.5">{feature.icon}</div>
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar app
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div className={`surface border border-muted rounded-lg p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold">Instalá la app de Rastuci</h3>
            <p className="text-sm text-muted">
              Rápida, fácil y sin necesidad de descargas
            </p>
          </div>
        </div>
      </div>
      {showFeatures && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {FEATURES.map((feature) => (
            <div
              key={`compact-feature-${feature.title}`}
              className="flex items-center gap-2"
            >
              <div className="text-primary">{feature.icon}</div>
              <span className="text-sm font-medium">{feature.title}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleDismiss} className="flex-1">
          Cancelar
        </Button>
        <Button
          onClick={handleInstall}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Instalar app
        </Button>
      </div>
    </div>
  );
}
