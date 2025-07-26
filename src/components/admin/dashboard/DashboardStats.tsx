import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardStats as IDashboardStats } from "@/hooks/useDashboard";

interface DashboardStatsProps {
  stats: IDashboardStats | null;
  loading: boolean;
}

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString("es-CO")}`;
};

export const DashboardStats = ({ stats, loading }: DashboardStatsProps) => {
  const statCards = [
    {
      title: "Total Productos",
      value: stats?.totalProducts || 0,
      icon: (
        <svg
          className="h-3 w-3 sm:h-4 sm:w-4 text-primary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      description: "Productos activos en catálogo",
    },
    {
      title: "Categorías",
      value: stats?.totalCategories || 0,
      icon: (
        <svg
          className="h-3 w-3 sm:h-4 sm:w-4 text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      description: "Categorías de productos",
    },
    {
      title: "Pedidos",
      value: stats?.totalOrders || 0,
      icon: (
        <svg
          className="h-3 w-3 sm:h-4 sm:w-4 text-primary-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      description: `${stats?.pendingOrders || 0} pendientes`,
      extraInfo: true,
    },
    {
      title: "Ingresos",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: (
        <svg
          className="h-3 w-3 sm:h-4 sm:w-4 text-primary-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      description: "Total en ventas",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
      {statCards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {loading ? "..." : card.value}
            </div>
            <p className="text-xs text-content-secondary mt-1">
              {card.extraInfo && card.title === "Pedidos" ? (
                <>
                  <span className="text-warning font-medium">
                    {stats?.pendingOrders || 0}
                  </span>{" "}
                  <span className="hidden sm:inline">pendientes</span>
                  <span className="sm:hidden">pend.</span>
                </>
              ) : (
                <span className="hidden sm:block">{card.description}</span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
