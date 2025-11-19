"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

function NotFoundContent() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen surface px-4">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="h-32 w-32 bg-primary rounded-full flex items-center justify-center text-white text-5xl font-bold mx-auto mb-6">
              404
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Página de administración no encontrada
            </h1>
            <p className="mt-4 text-base muted">
              Lo sentimos, la página que estás buscando no existe o ha sido
              movida.
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

  // Página 404 pública
  return (
    <div className="flex flex-col items-center justify-center min-h-screen surface px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="relative w-64 h-64 mx-auto mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-9xl font-bold text-primary opacity-20">
                404
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
            ¡Ups! Página no encontrada
          </h1>
          <p className="text-lg muted max-w-lg mx-auto">
            La página que estás buscando no existe o ha sido movida. Pero no te
            preocupes, tenemos muchas otras cosas increíbles para mostrarte.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg">
              Volver al inicio
            </Button>
          </Link>
          <Link href="/productos">
            <Button variant="outline" size="lg">
              Ver productos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen surface px-4">
          <div className="animate-pulse">
            <div className="w-32 h-32 bg-surface-secondary rounded mb-8"></div>
            <div className="w-64 h-8 bg-surface-secondary rounded mb-4"></div>
            <div className="w-48 h-6 bg-surface-secondary rounded"></div>
          </div>
        </div>
      }
    >
      <NotFoundContent />
    </Suspense>
  );
}
