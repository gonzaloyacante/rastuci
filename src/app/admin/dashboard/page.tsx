"use client";

import { useDashboard } from "@/hooks";
import { AdminPageHeader, AdminLoading, AdminError } from "@/components/admin";
import {
  DashboardStats,
  DashboardCharts,
  RecentOrders,
  LowStockProducts,
  QuickActions,
} from "@/components/admin/dashboard";

export default function AdminDashboard() {
  const {
    stats,
    recentOrders,
    lowStockProducts,
    categoryData,
    monthlySales,
    loading,
    error,
  } = useDashboard();

  if (loading) {
    return <AdminLoading />;
  }

  if (error) {
    return <AdminError message={error} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7FA] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-10 w-full overflow-x-hidden">
        <AdminPageHeader
          title="Dashboard"
          subtitle="Resumen general del negocio"
          className="mb-8"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Productos */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="bg-[#F5F5F5] rounded-full p-3 mb-3">
              <svg
                className="w-7 h-7 text-[#6C63FF]"
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
            </div>
            <div className="text-3xl font-bold text-[#222]">
              {stats?.totalProducts ?? 0}
            </div>
            <div className="text-sm text-[#888] mt-1">Productos</div>
          </div>
          {/* Total Categorías */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="bg-[#F5F5F5] rounded-full p-3 mb-3">
              <svg
                className="w-7 h-7 text-[#00BFA6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#222]">
              {stats?.totalCategories ?? 0}
            </div>
            <div className="text-sm text-[#888] mt-1">Categorías</div>
          </div>
          {/* Total Pedidos */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="bg-[#F5F5F5] rounded-full p-3 mb-3">
              <svg
                className="w-7 h-7 text-[#FFB300]"
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
            </div>
            <div className="text-3xl font-bold text-[#222]">
              {stats?.totalOrders ?? 0}
            </div>
            <div className="text-sm text-[#888] mt-1">Pedidos</div>
          </div>
          {/* Ingresos */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="bg-[#F5F5F5] rounded-full p-3 mb-3">
              <svg
                className="w-7 h-7 text-[#43A047]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8m8-8a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#222]">
              $
              {stats?.totalRevenue?.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 2,
              }) ?? "$0"}
            </div>
            <div className="text-sm text-[#888] mt-1">Ingresos</div>
          </div>
        </div>

        {/* Charts */}
        <DashboardCharts
          categoryData={categoryData}
          monthlySales={monthlySales}
          loading={loading}
        />

        {/* Recent Orders and Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-[#222] mb-4">
              Pedidos Recientes
            </h3>
            <RecentOrders recentOrders={recentOrders} loading={loading} />
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-6">
            <QuickActions />
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="mt-10">
          <LowStockProducts
            lowStockProducts={lowStockProducts}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
