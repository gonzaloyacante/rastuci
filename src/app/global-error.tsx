"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error — Rastuci</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #111; }
          .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; text-align: center; }
          .inner { max-width: 28rem; }
          .emoji { font-size: 4rem; margin-bottom: 1.5rem; }
          h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
          p { color: #555; margin-bottom: 2rem; line-height: 1.6; }
          .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
          button { padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 500; cursor: pointer; border: none; }
          .primary { background: #000; color: #fff; }
          .primary:hover { background: #333; }
          .secondary { background: transparent; color: #111; border: 1px solid #ccc; }
          .secondary:hover { background: #f5f5f5; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="inner">
            <div className="emoji">😕</div>
            <h1>¡Ups! Algo salió mal</h1>
            <p>
              Ocurrió un error inesperado. Por favor, intenta recargar la página
              o vuelve al inicio.
            </p>
            <div className="actions">
              <button className="primary" onClick={() => reset()}>
                Reintentar
              </button>
              <button
                className="secondary"
                onClick={() => (window.location.href = "/")}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
