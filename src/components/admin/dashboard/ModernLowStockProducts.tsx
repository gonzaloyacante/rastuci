"use client";

import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
  ImageIcon,
  Archive,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  minStock?: number;
  price?: number;
  image?: string;
  category?: string;
}

interface ModernLowStockProductsProps {
  products: LowStockProduct[];
  loading?: boolean;
}

export default function ModernLowStockProducts({
  products,
  loading = false,
}: ModernLowStockProductsProps) {
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

  const getStockLevel = (stock: number) => {
    if (stock === 0) return { label: "Sin stock", color: "text-error", bg: "bg-red-50", border: "border-red-200" };
    if (stock <= 5) return { label: "Crítico", color: "text-error", bg: "bg-red-50", border: "border-red-200" };
    if (stock <= 10) return { label: "Bajo", color: "text-warning", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "Normal", color: "text-success", bg: "bg-green-50", border: "border-green-200" };
  };

  if (loading) {
    return (
      <div className="surface rounded-2xl shadow-sm border muted p-6">
        <div className="animate-pulse">
          <div className="h-6 surface-secondary rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 surface-secondary rounded-xl"></div>
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
          <h2 className="text-xl font-bold text-primary">Productos con Bajo Stock</h2>
          <p className="text-sm muted mt-1">
            Productos que requieren reposición urgente
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <Link
            href="/admin/productos?filter=low-stock"
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 muted mx-auto mb-3" />
          <p className="text-sm muted">Todos los productos tienen stock suficiente</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {products.slice(0, 6).map((product) => {
            const stockLevel = getStockLevel(product.stock);

            return (
              <motion.div key={product.id} variants={itemVariants}>
                <Link href={`/admin/productos/${product.id}/editar`}>
                  <div className="group relative overflow-hidden rounded-xl surface border muted p-4 hover:shadow-md transition-all duration-300 cursor-pointer">
                    {/* Critical Stock Warning */}
                    {product.stock === 0 && (
                      <div className="absolute top-2 right-2 w-2 h-2 badge-error rounded-full animate-pulse"></div>
                    )}

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                    <div className="relative flex items-start space-x-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 muted" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        
                        {product.category && (
                          <p className="text-xs muted mt-1">{product.category}</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Archive className="h-3 w-3 muted" />
                            <span className="text-xs font-medium text-primary">
                              {product.stock} unidades
                            </span>
                          </div>
                          
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockLevel.bg} ${stockLevel.color} ${stockLevel.border} border`}
                          >
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {stockLevel.label}
                          </span>
                        </div>

                        {product.price && (
                          <div className="mt-2">
                            <span className="text-xs muted">Precio: </span>
                            <span className="text-xs font-medium text-success">
                              {product.price.toLocaleString("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                minimumFractionDigits: 0,
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hover Arrow */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-6 h-6 rounded-full surface-secondary flex items-center justify-center">
                          <ArrowRight className="w-3 h-3 text-primary" />
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

      {products.length > 6 && (
        <div className="mt-4 text-center">
          <Link
            href="/admin/productos?filter=low-stock"
            className="inline-flex items-center px-4 py-2 rounded-lg surface-secondary text-sm font-medium text-primary hover:surface hover:shadow-sm transition-all duration-200"
          >
            <Package className="h-4 w-4 mr-2" />
            Ver {products.length - 6} productos más
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
}