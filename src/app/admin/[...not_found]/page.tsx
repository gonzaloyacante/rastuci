"use client";

import { Button } from "@/components/ui/Button";
import { logger } from "@/lib/logger";
import Link from "next/link";
import { useEffect } from "react";

export default function CatchAllNotFound() {
  useEffect(() => {
    // Verificamos si estamos en modo de desarrollo
    if (process.env.NODE_ENV === "development") {
      logger.info("404 Admin - Ruta no encontrada", {
        path: window.location.pathname,
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] surface px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="h-32 w-32 bg-primary rounded-full flex items-center justify-center text-white text-5xl font-bold mx-auto mb-6">
            404
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Página de administración no encontrada
          </h1>
          <p className="mt-4 text-base muted">
            Lo sentimos, la página de administración que estás buscando no
            existe o ha sido movida.
          </p>
        </div>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <Link href="/admin/dashboard">
            <Button variant="primary">Volver al Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Ver tienda</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
