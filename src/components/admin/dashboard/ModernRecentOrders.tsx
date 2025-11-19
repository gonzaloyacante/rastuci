"use client";

import { motion } from "framer-motion";
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Package,
    ShoppingCart,
    Truck,
    XCircle,
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  customerName: string;
  status: string;
  total: number;
  items: number;
  date: string;
}

interface ModernRecentOrdersProps {
  orders: Order[];
  loading?: boolean;
}

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  confirmed: {
    label: "Confirmado",
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  shipped: {
    label: "Enviado",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  delivered: {
    label: "Entregado",
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

export default function ModernRecentOrders({
  orders,
  loading = false,
}: ModernRecentOrdersProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <div className="surface rounded-2xl shadow-sm border muted p-6">
        <div className="animate-pulse">
          <div className="h-6 surface-secondary rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={`item-${i}`}
                className="h-16 surface-secondary rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface rounded-2xl shadow-sm border muted p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">Pedidos Recientes</h2>
          <p className="text-sm muted mt-1">
            Últimos pedidos realizados por los clientes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <Link
            href="/admin/pedidos"
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 muted mx-auto mb-3" />
          <p className="text-sm muted">No hay pedidos recientes</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {orders.slice(0, 5).map((order) => {
            const status =
              statusConfig[order.status as keyof typeof statusConfig] ||
              statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <motion.div key={order.id} variants={itemVariants}>
                <Link href={`/admin/pedidos/${order.id}`}>
                  <div className="group relative overflow-hidden rounded-xl surface border muted p-4 hover:shadow-md transition-all duration-300 cursor-pointer">
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Order Icon */}
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-white" />
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                              #{order.id}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} ${status.border} border`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs muted">{order.customerName}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 muted" />
                              <span className="text-xs muted">
                                {new Date(order.date).toLocaleDateString(
                                  "es-AR",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Package className="h-3 w-3 muted" />
                              <span className="text-xs muted">
                                {order.items} item{order.items !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Total */}
                      <div className="shrink-0 text-right">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-success" />
                          <span className="text-sm font-bold text-success">
                            {order.total.toLocaleString("es-AR", {
                              style: "currency",
                              currency: "ARS",
                              minimumFractionDigits: 0,
                            })}
                          </span>
                        </div>

                        {/* Hover Arrow */}
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-6 h-6 rounded-full surface-secondary flex items-center justify-center ml-auto">
                            <ArrowRight className="w-3 h-3 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
