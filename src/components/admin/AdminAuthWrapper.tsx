"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useAdminSession } from "@/hooks/useAdminAuth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAdminSession();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Dar un pequeño delay para evitar flash de contenido
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
    // Importante: devolver undefined explícitamente
    return undefined;
  }, [isLoading]);

  // Mientras carga la sesión
  if (isLoading || !showContent) {
    return (
      <div className="min-h-screen surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm muted">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si está en la página de login, mostrar contenido sin autenticación
  if (typeof window !== "undefined" && window.location.pathname === "/admin") {
    return <>{children}</>;
  }

  // Si no está autenticado en otras páginas, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sesión requerida</h1>
          <p className="text-muted mb-6">
            Debes iniciar sesión para acceder al panel de administración.
          </p>
          <Link href="/admin" className="btn-primary">
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>;
}
