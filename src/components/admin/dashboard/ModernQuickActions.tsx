"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Tag,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "success" | "warning" | "error" | "info";
  gradient: string;
}

export default function ModernQuickActions() {
  const quickActions: QuickAction[] = [
    {
      title: "Nuevo Producto",
      description: "Agregar producto al catálogo",
      href: "/admin/productos/nuevo",
      icon: Plus,
      color: "primary",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Gestionar Productos",
      description: "Ver y editar productos",
      href: "/admin/productos",
      icon: Package,
      color: "success",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Ver Pedidos",
      description: "Gestionar pedidos recibidos",
      href: "/admin/pedidos",
      icon: ShoppingCart,
      color: "warning",
      gradient: "from-amber-500 to-amber-600",
    },
    {
      title: "Usuarios",
      description: "Administrar usuarios",
      href: "/admin/usuarios",
      icon: Users,
      color: "info",
      gradient: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Categorías",
      description: "Organizar categorías",
      href: "/admin/categorias",
      icon: Tag,
      color: "primary",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Reportes",
      description: "Analíticas y reportes",
      href: "/admin/reportes",
      icon: BarChart3,
      color: "success",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Configuración",
      description: "Ajustes del sistema",
      href: "/admin/configuracion",
      icon: Settings,
      color: "error",
      gradient: "from-red-500 to-red-600",
    },
    {
      title: "Contenido Web",
      description: "Gestionar contenido",
      href: "/admin/home",
      icon: FileText,
      color: "warning",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="surface rounded-2xl shadow-sm border muted p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">Acciones Rápidas</h2>
          <p className="text-sm muted mt-1">
            Accesos directos a las funciones principales
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickActions.map((action) => (
          <motion.div key={action.title} variants={itemVariants}>
            <Link href={action.href}>
              <div className="group relative overflow-hidden rounded-xl surface border muted p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                <div className="relative flex items-start space-x-3">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <action.icon className="h-5 w-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs muted mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-5 h-5 rounded-full surface-secondary flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}