"use client";

import { AdminError } from "@/components/admin";
import {
  AdminSection,
  PageHeader,
  StatCardData,
  StatsGrid,
} from "@/components/admin/AdminCards";
import ModernDashboardCharts from "@/components/admin/dashboard/ModernDashboardCharts";
import AdvancedCharts from "@/components/admin/dashboard/AdvancedCharts";
import {
  QuickAction,
  QuickActionsGrid,
} from "@/components/admin/dashboard/QuickActionCard";
import { DashboardSkeleton } from "@/components/admin/skeletons";
import { useDashboard } from "@/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { motion } from "framer-motion";
import {
  DollarSign,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";

const quickActions: QuickAction[] = [
  {
    href: "/admin/productos/nuevo",
    icon: Plus,
    title: "Nuevo Producto",
    description: "Agregar producto al catálogo",
    color: "blue",
  },
  {
    href: "/admin/productos",
    icon: Package,
    title: "Gestionar Productos",
    description: "Ver y editar productos",
    color: "emerald",
  },
  {
    href: "/admin/pedidos",
    icon: ShoppingCart,
    title: "Ver Pedidos",
    description: "Gestionar pedidos recibidos",
    color: "amber",
  },
  {
    href: "/admin/categorias",
    icon: Tag,
    title: "Categorías",
    description: "Organizar categorías",
    color: "purple",
  },
];

export default function AdminDashboard() {
  useDocumentTitle({ title: "Dashboard" });
  const { stats, categoryData, monthlySales, loading, error } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <AdminError message={error} />;
  }

  const dashboardStats: StatCardData[] = [
    {
      icon: Package,
      label: "Productos",
      value: stats?.totalProducts || 0,
      change: stats?.changes?.products,
      color: "blue",
    },
    {
      icon: ShoppingCart,
      label: "Pedidos",
      value: stats?.totalOrders || 0,
      change: stats?.changes?.orders,
      color: "emerald",
    },
    {
      icon: DollarSign,
      label: "Ingresos",
      value: `$${(stats?.totalRevenue || 0).toLocaleString("es-AR")}`,
      change: stats?.changes?.revenue,
      color: "amber",
    },
    {
      icon: Users,
      label: "Categorías",
      value: stats?.totalCategories || 0,
      change: stats?.changes?.categories,
      color: "cyan",
    },
  ];

  return (
    <div className="min-h-screen surface p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageHeader
            title="Dashboard"
            subtitle="Resumen general del negocio"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatsGrid stats={dashboardStats} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AdminSection
            title="Acciones Rápidas"
            subtitle="Accesos directos a las funciones principales"
            icon={Settings}
            iconColor="blue"
          >
            <QuickActionsGrid actions={quickActions} />
          </AdminSection>
        </motion.div>

        <ModernDashboardCharts
          categoryData={categoryData || []}
          monthlySales={monthlySales || []}
          loading={loading}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <AdvancedCharts loading={loading} />
        </motion.div>
      </div>
    </div>
  );
}
