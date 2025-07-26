import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="text-base sm:text-lg lg:text-xl">
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 lg:space-y-4 p-3 sm:p-4 lg:p-6">
        <Link href="/admin/productos/nuevo">
          <Button className="btn-primary w-full justify-start text-xs sm:text-sm lg:text-base py-2 sm:py-3">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar Producto
          </Button>
        </Link>

        <Link href="/admin/categorias/nueva">
          <Button
            className="w-full justify-start text-xs sm:text-sm lg:text-base py-2 sm:py-3"
            variant="outline">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Crear Categoría
          </Button>
        </Link>

        <Link href="/admin/pedidos?status=PENDING">
          <Button
            className="w-full justify-start text-xs sm:text-sm lg:text-base py-2 sm:py-3"
            variant="outline">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Ver Pedidos Pendientes
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
