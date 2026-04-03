"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "rastuci-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) setVisible(true);
    } catch {
      // localStorage no disponible (SSR o modo privado extremo)
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignorar si no hay acceso a localStorage
    }
    setVisible(false);
  };

  const acceptNecessary = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "necessary");
    } catch {
      // ignorar
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 surface border-t border-muted shadow-lg"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm">
          <p className="font-semibold mb-1">🍪 Usamos cookies</p>
          <p className="text-muted">
            Utilizamos cookies técnicas necesarias para el funcionamiento del
            sitio (sesión, carrito de compras) y cookies de monitoreo de errores
            (Sentry) para mejorar tu experiencia. Al continuar navegando,
            aceptás nuestra{" "}
            <a href="/legal/privacy" className="underline hover:text-primary">
              Política de Privacidad
            </a>{" "}
            (Ley 25.326).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={acceptNecessary}
          >
            Solo necesarias
          </Button>
          <Button type="button" size="sm" onClick={accept}>
            Acepto todas
          </Button>
        </div>
      </div>
    </div>
  );
}
