"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="text-[#E91E63] text-9xl font-bold">404</div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Página de la tienda no encontrada
          </h1>
          <p className="mt-4 text-base text-gray-600">
            Lo sentimos, no pudimos encontrar la página que estás buscando en
            nuestra tienda.
          </p>
        </div>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <Link href="/">
            <Button className="bg-[#E91E63] hover:bg-[#C2185B]">
              Volver al inicio
            </Button>
          </Link>
          <Link href="/productos">
            <Button variant="outline">Ver productos</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
