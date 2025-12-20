import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Interfaces para tipado
interface OrderWithItems {
  id: string;
  customerName: string;
  total: number;
  createdAt: Date;
  status: string;
  order_items: Array<{
    products: {
      id: string;
      name: string;
    };
  }>;
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
      prisma.orders.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          order_items: {
            include: {
              products: true,
            },
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

    // Calcular ingresos totales y por período
    const [totalRevenueResult, revenueThisMonth, revenueLastMonth] =
      await Promise.all([
        prisma.orders.aggregate({ _sum: { total: true } }),
        prisma.orders.aggregate({
          _sum: { total: true },
          where: { createdAt: { gte: startOfThisMonth } },
        }),
        prisma.orders.aggregate({
          _sum: { total: true },
          where: {
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        }),
      ]);

    const totalRevenue = Number(totalRevenueResult._sum.total) || 0;
    const revenueThisMonthValue = Number(revenueThisMonth._sum.total) || 0;
    const revenueLastMonthValue = Number(revenueLastMonth._sum.total) || 0;

    // Calcular cambios porcentuales
    const productsChange = calculateChange(
      productsAddedThisMonth,
      productsAddedLastMonth
    );
    const ordersChange = calculateChange(ordersThisMonth, ordersLastMonth);
    const revenueChange = calculateChange(
      revenueThisMonthValue,
      revenueLastMonthValue
    );
    const categoriesChange = calculateChange(totalCategories, totalCategories); // Categorías no cambian mucho

    // Obtener productos con bajo stock
    const lowStockProducts = await prisma.products.findMany({
      where: {
        stock: {
          lt: 10,
        },
      },
      take: 5,
      orderBy: {
        stock: "asc",
      },
    });

    // Formatea las órdenes recientes para el dashboard
    const formattedRecentOrders = recentOrders.map((order: OrderWithItems) => ({
      id: order.id,
      customerName: order.customerName,
      total: order.total,
      date: order.createdAt,
      status: order.status,
      items: order.order_items.length,
    }));

    // Obtener productos por categoría usando Prisma
    const productsByCategory = await prisma.categories.findMany({
      select: {
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const formattedProductsByCategory = productsByCategory.map(
      (category: CategoryWithCount) => ({
        category: category.name,
        count: category._count.products,
      })
    );

    // Ventas mensuales (últimos 6 meses)
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthRevenue = await prisma.orders.aggregate({
        _sum: { total: true },
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      monthlySales.push({
        month: monthStart.toLocaleDateString("es-AR", { month: "short" }),
        revenue: Number(monthRevenue._sum.total) || 0,
      });
    }

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
