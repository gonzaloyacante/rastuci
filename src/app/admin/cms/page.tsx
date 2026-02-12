"use client";

import { AdminPageHeader } from "@/components/admin";
import { Card } from "@/components/ui/Card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function CMSPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestor de Contenidos (CMS)"
        subtitle="Administra el contenido dinámico del sitio web"
      />

      {/* Deprecation Notice */}
      <Card className="p-6 border-warning bg-warning/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-warning">
              Panel CMS Migrado
            </h2>
            <p className="text-sm text-content-secondary mt-1">
              Este panel genérico ha sido reemplazado por editores específicos
              con mejor UX. Usa los enlaces directos a cada sección:
            </p>
          </div>
        </div>
      </Card>

      {/* Direct links to specific settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/settings" className="block group">
          <Card className="p-5 hover:border-primary transition-colors">
            <h3 className="font-semibold group-hover:text-primary">
              ⚙️ Configuración General
            </h3>
            <p className="text-sm text-content-secondary mt-1">
              Home, contacto, tienda, stock, envío
            </p>
          </Card>
        </Link>

        <Link href="/admin/legal" className="block group">
          <Card className="p-5 hover:border-primary transition-colors">
            <h3 className="font-semibold group-hover:text-primary">
              📋 Políticas Legales
            </h3>
            <p className="text-sm text-content-secondary mt-1">
              Términos, privacidad, defensa del consumidor
            </p>
          </Card>
        </Link>

        <Link href="/admin/categories" className="block group">
          <Card className="p-5 hover:border-primary transition-colors">
            <h3 className="font-semibold group-hover:text-primary">
              🏷️ Categorías
            </h3>
            <p className="text-sm text-content-secondary mt-1">
              Administrar categorías de productos
            </p>
          </Card>
        </Link>

        <Link href="/admin/products" className="block group">
          <Card className="p-5 hover:border-primary transition-colors">
            <h3 className="font-semibold group-hover:text-primary">
              📦 Productos
            </h3>
            <p className="text-sm text-content-secondary mt-1">
              Crear, editar y gestionar productos
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
