"use client";

import { AdminError } from "@/components/admin";
import ModernDashboardCharts from "@/components/admin/dashboard/ModernDashboardCharts";
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
import Link from "next/link";

export default function AdminDashboard() {
  useDocumentTitle({ title: "Dashboard" });
  const { stats, categoryData, monthlySales, loading, error } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <AdminError message={error} />;
  }

  // Usar las estadísticas
  const totalProducts = stats?.totalProducts || 0;
  const totalOrders = stats?.totalOrders || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const totalCategories = stats?.totalCategories || 0;
  return (
    <div className="min-h-screen surface p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted">
            Resumen general del negocio
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl surface shadow-sm border muted hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="badge-success text-xs sm:text-sm">+12.5%</span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium muted mb-1">
                Total Productos
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {totalProducts}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl surface shadow-sm border muted hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="badge-success text-xs sm:text-sm">+8.2%</span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium muted mb-1">
                Pedidos
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {totalOrders}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl surface shadow-sm border muted hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="badge-success text-xs sm:text-sm">+15.3%</span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium muted mb-1">
                Ingresos
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                ${totalRevenue}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl surface shadow-sm border muted hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="badge-success text-xs sm:text-sm">+5.1%</span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium muted mb-1">
                Clientes
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {totalCategories}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="surface rounded-xl sm:rounded-2xl shadow-sm border muted p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-primary">
                Acciones Rápidas
              </h2>
              <p className="text-xs sm:text-sm muted mt-1">
                Accesos directos a las funciones principales
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <Settings className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/admin/productos/nuevo">
              <div className="group relative overflow-hidden rounded-lg sm:rounded-xl surface border muted p-3 sm:p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-start space-x-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                      Nuevo Producto
                    </h3>
                    <p className="text-[10px] sm:text-xs muted mt-0.5 sm:mt-1">
                      Agregar producto al catálogo
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/productos">
              <div className="group relative overflow-hidden rounded-lg sm:rounded-xl surface border muted p-3 sm:p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-start space-x-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                      Gestionar Productos
                    </h3>
                    <p className="text-[10px] sm:text-xs muted mt-0.5 sm:mt-1">
                      Ver y editar productos
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/pedidos">
              <div className="group relative overflow-hidden rounded-lg sm:rounded-xl surface border muted p-3 sm:p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-start space-x-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                      Ver Pedidos
                    </h3>
                    <p className="text-[10px] sm:text-xs muted mt-0.5 sm:mt-1">
                      Gestionar pedidos recibidos
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/categorias">
              <div className="group relative overflow-hidden rounded-lg sm:rounded-xl surface border muted p-3 sm:p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-start space-x-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                      Categorías
                    </h3>
                    <p className="text-[10px] sm:text-xs muted mt-0.5 sm:mt-1">
                      Organizar categorías
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Charts Section */}
        <ModernDashboardCharts
          categoryData={categoryData || []}
          monthlySales={monthlySales || []}
          loading={loading}
        />
      </div>
    </div>
  );
}
