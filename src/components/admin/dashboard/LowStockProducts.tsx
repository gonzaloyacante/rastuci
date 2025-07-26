import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LowStockProduct } from "@/hooks/useDashboard";

interface LowStockProductsProps {
  lowStockProducts: LowStockProduct[];
  loading: boolean;
}

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString("es-CO")}`;
};

export const LowStockProducts = ({
  lowStockProducts,
  loading,
}: LowStockProductsProps) => {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="text-base sm:text-lg lg:text-xl">
          Productos con Bajo Stock
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {loading ? (
          <div className="flex justify-center items-center h-32 sm:h-40">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
          </div>
        ) : lowStockProducts.length > 0 ? (
          <div className="divide-y">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-content-secondary">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock < 5 ? "badge-error" : "badge-warning"
                    }`}>
                    {product.stock} en stock
                  </span>
                  <Link href={`/admin/productos/${product.id}/editar`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm">
                      Editar
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 text-content-secondary">
            <p className="text-sm sm:text-base">
              No hay productos con bajo stock
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
