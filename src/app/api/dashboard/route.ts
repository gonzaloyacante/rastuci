import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

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
    // OPTIMIZACIÓN: Mapeo ajustado a la nueva estructura de query
    const formattedRecentOrders = recentOrders.map((order: RecentOrder) => ({
      id: order.id,
      customerName: order.customerName,
      total: Number(order.total),
      date: order.createdAt,
      status: order.status,
      items: order._count.order_items,
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

    // Ventas mensuales (últimos 6 meses) - OPTIMIZACIÓN N+1
    // En lugar de una query por mes, traemos todo de una vez y agregamos en memoria
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Inicio del mes hace 6 meses

    const monthlyOperations = await prisma.orders.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    const monthlySalesMap = new Map<string, number>();

    // Inicializar mapa con 0 para los últimos 6 meses (para mantener el orden y cubrir meses sin ventas)
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const key = d.toLocaleDateString("es-AR", { month: "short" });
      monthlySalesMap.set(key, 0);
    }

    // Sumar totales
    monthlyOperations.forEach((order) => {
      const key = order.createdAt.toLocaleDateString("es-AR", {
        month: "short",
      });
      // Solo sumar si el mes está en el rango (debería estarlo por el where, pero por seguridad)
      if (monthlySalesMap.has(key)) {
        const current = monthlySalesMap.get(key) || 0;
        monthlySalesMap.set(key, current + Number(order.total));
      } else {
        // Fallback por si acaso las fechas no coinciden exactamente con la generación de claves
        // (ej: diferencia de timezone en borde de mes).
        // En este caso simple, podríamos ignorarlo o agregarlo dinámicamente.
        // Lo agregaremos dinámicamente si no existe, aunque el loop de inicialización debería cubrirlo.
        monthlySalesMap.set(
          key,
          (monthlySalesMap.get(key) || 0) + Number(order.total)
        );
      }
    });

    const monthlySales = Array.from(monthlySalesMap.entries()).map(
      ([month, revenue]) => ({
        month,
        revenue,
      })
    );

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
