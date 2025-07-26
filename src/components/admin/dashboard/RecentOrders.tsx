import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RecentOrder } from "@/hooks/useDashboard";

interface RecentOrdersProps {
  recentOrders: RecentOrder[];
  loading: boolean;
}

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString("es-CO")}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const RecentOrders = ({ recentOrders, loading }: RecentOrdersProps) => {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="text-base sm:text-lg lg:text-xl">
          Pedidos Pendientes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40 sm:h-48 lg:h-64">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 border-b-2 border-primary"></div>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="card-compact hover:card-hover transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base truncate">
                      {order.customerName}
                    </h3>
                    <p className="text-xs sm:text-sm text-content-secondary">
                      {formatDate(order.date)}
                    </p>
                  </div>
                  <span className="text-primary font-medium text-sm sm:text-base">
                    {formatCurrency(order.total)}
                  </span>
                </div>
                <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <span className="text-xs badge-warning px-2 py-1 rounded-full w-fit">
                    {order.items} {order.items === 1 ? "item" : "items"}
                  </span>
                  <Link href={`/admin/pedidos/${order.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            <div className="text-center mt-4">
              <Link href="/admin/pedidos?status=PENDING">
                <Button variant="outline" className="w-full sm:w-auto">
                  Ver todos los pedidos pendientes
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 text-content-secondary">
            <p className="text-sm sm:text-base">No hay pedidos pendientes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
