import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface CategoryCount {
  category: string;
  count: bigint;
}

interface MonthlySalesRaw {
  month: string;
  revenue: bigint;
}

export async function GET() {
  try {
    // Obtener estadísticas
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      recentOrders,
      productsByCategoryCount,
      monthlySales,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.$queryRaw`
        SELECT c.name as category, COUNT(p.id) as count
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoryId
        GROUP BY c.id
      `,
      prisma.$queryRaw`
        SELECT strftime('%m', createdAt) as month, SUM(total) as revenue
        FROM orders
        WHERE createdAt > date('now', '-1 year')
        GROUP BY strftime('%m', createdAt)
        ORDER BY month
      `,
    ]);

    // Calcular ingresos totales
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });

    const totalRevenue = Number(totalRevenueResult._sum.total) || 0;

    // Obtener productos con bajo stock
    const lowStockProducts = await prisma.product.findMany({
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
    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      total: order.total,
      date: order.createdAt,
      status: order.status,
      items: order.items.length,
    }));

    // Convertir BigInt a Number para las consultas raw
    const formattedProductsByCategory = (
      productsByCategoryCount as CategoryCount[]
    ).map((item: CategoryCount) => ({
      category: item.category,
      count: Number(item.count),
    }));

    const formattedMonthlySales = (monthlySales as MonthlySalesRaw[]).map(
      (item: MonthlySalesRaw) => ({
        month: item.month,
        revenue: Number(item.revenue),
      })
    );

    return NextResponse.json({
      stats: {
        totalProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        totalRevenue,
      },
      recentOrders: formattedRecentOrders,
      lowStockProducts,
      productsByCategoryCount: formattedProductsByCategory,
      monthlySales: formattedMonthlySales,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
