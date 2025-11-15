import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Interfaces para tipado
interface OrderWithItems {
  id: string;
  customerName: string;
  total: number;
  createdAt: Date;
  status: string;
  items: Array<{
    product: {
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

export async function GET() {
  try {
    // Obtener estadísticas básicas
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      recentOrders,
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
    const formattedRecentOrders = recentOrders.map((order: OrderWithItems) => ({
      id: order.id,
      customerName: order.customerName,
      total: order.total,
      date: order.createdAt,
      status: order.status,
      items: order.items.length,
    }));

    // Obtener productos por categoría usando Prisma
    const productsByCategory = await prisma.category.findMany({
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
      monthlySales: [], // Simplificado por ahora
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
}
