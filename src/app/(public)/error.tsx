"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold mb-4 font-heading">
        ¡Ups! Algo salió mal
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        No pudimos cargar esta página correctamente. Por favor, intenta recargar
        o vuelve más tarde.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="primary">
          Reintentar
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
