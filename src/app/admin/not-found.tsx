"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminNotFound() {
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
            <Button variant="primary">
              Volver al Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Ver tienda</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
