"use client";

import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: "positive" | "negative";
  icon: React.ComponentType<{ className?: string }>;
  trend?: number[];
  color?: "primary" | "success" | "warning" | "error" | "info";
}

interface DashboardStatsProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    productsChange: number;
    ordersChange: number;
    revenueChange: number;
    customersChange: number;
  };
}

const StatCard = ({ title, value, change, changeType, icon: Icon, trend, color = "primary" }: StatCardProps) => {
  const colorClasses = {
    primary: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
    success: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
    warning: "bg-gradient-to-br from-amber-500 to-amber-600 text-white",
    error: "bg-gradient-to-br from-red-500 to-red-600 text-white",
    info: "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white",
  };

  const ArrowIcon = changeType === "positive" ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl surface shadow-sm border muted hover:shadow-lg transition-all duration-300 group"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-50"></div>
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            changeType === "positive" 
              ? "bg-emerald-50 text-emerald-700" 
              : "bg-red-50 text-red-700"
          }`}>
            <ArrowIcon className="w-3 h-3" />
            <span>{Math.abs(change)}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium muted">{title}</h3>
          <p className="text-2xl font-bold text-primary">{value}</p>
        </div>

        {/* Mini Trend Chart */}
        {trend && (
          <div className="mt-4 flex items-end justify-between h-8">
            {trend.map((point, index) => (
              <div
                key={index}
                className={`w-1 rounded-full ${colorClasses[color].includes('blue') ? 'bg-blue-200' : 
                  colorClasses[color].includes('emerald') ? 'bg-emerald-200' :
                  colorClasses[color].includes('amber') ? 'bg-amber-200' :
                  colorClasses[color].includes('red') ? 'bg-red-200' : 'bg-cyan-200'
                }`}
                style={{ height: `${(point / Math.max(...trend)) * 100}%` }}
              />
            ))}
          </div>
        )}

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>
    </motion.div>
  );
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statsData = [
    {
      title: "Total Productos",
      value: stats.totalProducts.toLocaleString(),
      change: stats.productsChange,
      changeType: stats.productsChange >= 0 ? "positive" : "negative",
      icon: Package,
      color: "primary",
      trend: Array.from([12, 19, 15, 25, 22, 30, 28]),
    },
    {
      title: "Pedidos",
      value: stats.totalOrders.toLocaleString(),
      change: stats.ordersChange,
      changeType: stats.ordersChange >= 0 ? "positive" : "negative",
      icon: ShoppingCart,
      color: "success",
      trend: Array.from([8, 12, 18, 15, 22, 19, 25]),
    },
    {
      title: "Ingresos",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      changeType: stats.revenueChange >= 0 ? "positive" : "negative",
      icon: DollarSign,
      color: "warning",
      trend: Array.from([15, 20, 18, 25, 22, 30, 35]),
    },
    {
      title: "Clientes",
      value: stats.totalCustomers.toLocaleString(),
      change: stats.customersChange,
      changeType: stats.customersChange >= 0 ? "positive" : "negative",
      icon: Users,
      color: "info",
      trend: Array.from([10, 15, 12, 18, 20, 25, 22]),
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </div>
  );
}