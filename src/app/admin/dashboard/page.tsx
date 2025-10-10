"use client";

import { useDashboard } from "@/hooks";
import { AdminPageHeader, AdminLoading, AdminError } from "@/components/admin";
import ModernDashboardLayout from "@/components/admin/dashboard/ModernDashboardLayout";
import ModernDashboardStats from "@/components/admin/dashboard/ModernDashboardStats";
import ModernQuickActions from "@/components/admin/dashboard/ModernQuickActions";
import ModernRecentOrders from "@/components/admin/dashboard/ModernRecentOrders";
import ModernLowStockProducts from "@/components/admin/dashboard/ModernLowStockProducts";
import {
  DashboardCharts,
} from "@/components/admin/dashboard";
import { LazySection } from "@/components/ui/LazySection";

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
    <ModernDashboardLayout>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Resumen general del negocio"
        className="mb-8"
      />

      {/* Modern Stats Cards */}
      <ModernDashboardStats 
        stats={{
          totalProducts: stats?.totalProducts ?? 0,
          totalOrders: stats?.totalOrders ?? 0,
          totalRevenue: stats?.totalRevenue ?? 0,
          totalCustomers: stats?.totalUsers ?? 0,
          productsChange: 12.5,
          ordersChange: 8.2,
          revenueChange: 15.3,
          customersChange: 5.1,
        }}
      />

      {/* Charts */}
      <LazySection className="space-y-6">
        <DashboardCharts
          categoryData={categoryData}
          monthlySales={monthlySales}
          loading={loading}
        />
      </LazySection>

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ModernRecentOrders 
          orders={recentOrders || []} 
          loading={loading} 
        />
        <ModernQuickActions />
      </div>

      {/* Low Stock Products */}
      <div className="mt-10">
        <ModernLowStockProducts
          products={lowStockProducts || []}
          loading={loading}
        />
      </div>
    </ModernDashboardLayout>
  );
}
