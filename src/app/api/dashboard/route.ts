import { Decimal } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

// Interfaces para tipado
// Updated interface for optimized query
interface RecentOrder {
  id: string;
  customerName: string;
  total: Decimal;
  createdAt: Date;
  status: string;
  _count: {
    order_items: number;
  };
}

interface CategoryWithCount {
  name: string;
  _count: {
    products: number;
  };
}

// Helper para calcular cambio porcentual
function calculateChange(
  current: number,
  previous: number
): { change: number; changePercent: string } {
  if (previous === 0) {
    return { change: current, changePercent: current > 0 ? "+100%" : "0%" };
  }
  const change = current - previous;
  const percent = ((change / previous) * 100).toFixed(1);
  return {
    change,
    changePercent: change >= 0 ? `+${percent}%` : `${percent}%`,
  };
}

interface MonthlyOrder {
  createdAt: Date;
  total: { toNumber?: () => number } | number | string;
}

function buildMonthlySales(
  now: Date,
  monthlyOperations: MonthlyOrder[]
): { month: string; revenue: number }[] {
  const map = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    map.set(d.toLocaleDateString("es-AR", { month: "short" }), 0);
  }
  for (const order of monthlyOperations) {
    const key = order.createdAt.toLocaleDateString("es-AR", { month: "short" });
    map.set(key, (map.get(key) || 0) + Number(order.total));
  }
  return Array.from(map.entries()).map(([month, revenue]) => ({
    month,
    revenue,
  }));
}

export const GET = withAdminAuth(async () => {
  try {
    // Fechas para comparación (este mes vs mes anterior)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Obtener estadísticas básicas
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      recentOrders,
      // Conteos del mes anterior para comparación
      ordersThisMonth,
      ordersLastMonth,
      productsAddedThisMonth,
      productsAddedLastMonth,
    ] = await Promise.all([
      prisma.products.count(),
      prisma.categories.count(),
      prisma.orders.count(),
      prisma.orders.count({ where: { status: "PENDING" } }),
      // OPTIMIZACIÓN: Usar select y count para evitar traer productos completos
      prisma.orders.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerName: true,
          total: true,
          createdAt: true,
          status: true,
          _count: {
            select: { order_items: true },
          },
        },
      }),
      // Pedidos este mes
      prisma.orders.count({
        where: { createdAt: { gte: startOfThisMonth } },
      }),
      // Pedidos mes anterior
      prisma.orders.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      // Productos agregados este mes
      prisma.products.count({
        where: { createdAt: { gte: startOfThisMonth } },
      }),
      // Productos agregados mes anterior
      prisma.products.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    const [totalRevenueResult, revenueThisMonth, revenueLastMonth] =
      await Promise.all([
        prisma.orders.aggregate({ _sum: { total: true } }),
        prisma.orders.aggregate({
          _sum: { total: true },
          where: { createdAt: { gte: startOfThisMonth } },
        }),
        prisma.orders.aggregate({
          _sum: { total: true },
          where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        }),
      ]);

    const totalRevenue = Number(totalRevenueResult._sum.total) || 0;
    const revenueThisMonthValue = Number(revenueThisMonth._sum.total) || 0;
    const revenueLastMonthValue = Number(revenueLastMonth._sum.total) || 0;

    const productsChange = calculateChange(
      productsAddedThisMonth,
      productsAddedLastMonth
    );
    const ordersChange = calculateChange(ordersThisMonth, ordersLastMonth);
    const revenueChange = calculateChange(
      revenueThisMonthValue,
      revenueLastMonthValue
    );
    const categoriesChange = calculateChange(totalCategories, totalCategories);

    const lowStockProducts = await prisma.products.findMany({
      where: { stock: { lt: 10 } },
      take: 5,
      orderBy: { stock: "asc" },
    });

    const formattedRecentOrders = recentOrders.map((order: RecentOrder) => ({
      id: order.id,
      customerName: order.customerName,
      total: Number(order.total),
      date: order.createdAt,
      status: order.status,
      items: order._count.order_items,
    }));

    const productsByCategory = await prisma.categories.findMany({
      select: { name: true, _count: { select: { products: true } } },
    });

    const formattedProductsByCategory = productsByCategory.map(
      (category: CategoryWithCount) => ({
        category: category.name,
        count: category._count.products,
      })
    );

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyOperations = await prisma.orders.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, total: true },
    });

    const monthlySales = buildMonthlySales(now, monthlyOperations);

    return NextResponse.json({
      stats: {
        totalProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        totalRevenue,
        // Cambios porcentuales
        changes: {
          products: productsChange.changePercent,
          orders: ordersChange.changePercent,
          revenue: revenueChange.changePercent,
          categories: categoriesChange.changePercent,
        },
      },
      recentOrders: formattedRecentOrders,
      lowStockProducts,
      productsByCategoryCount: formattedProductsByCategory,
      monthlySales,
    });
  } catch (error) {
    logger.error("Error al obtener estadísticas del dashboard:", {
      error: error,
    });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
});
