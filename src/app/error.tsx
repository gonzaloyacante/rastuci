"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-6">😕</div>
        <h2
          className="text-2xl font-bold mb-4"
          style={{ fontFamily: "inherit" }}
        >
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-gray-600 mb-8">
          No pudimos cargar la página correctamente. Por favor, intenta recargar
          o vuelve al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
        {process.env.NODE_ENV === "development" && error?.message && (
          <pre className="mt-8 p-4 bg-red-50 text-red-800 text-xs text-left rounded-lg overflow-auto max-h-48">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        )}
      </div>
    </div>
  );
}
