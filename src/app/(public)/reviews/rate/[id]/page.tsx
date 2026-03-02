import { Metadata } from "next";
import { notFound } from "next/navigation";

import OrderReviewForm from "@/components/reviews/OrderReviewForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Califica tu compra - Rastuci",
  robots: "noindex, nofollow", // Evitamos indexar estas páginas dinámicas
};

interface RateOrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RateOrderPage({ params }: RateOrderPageProps) {
  const { id } = await params;

  // Fetch order with products
  // Security: restrict reviews to completed orders only — prevents reviewing orders
  // that haven't been delivered yet, and limits the usefulness of ID enumeration attacks.
  const order = await prisma.orders.findUnique({
    where: {
      id,
      // Only allow reviews for delivered or processed orders
      status: { in: ["DELIVERED", "PROCESSED"] },
    },
    include: {
      order_items: {
        include: {
          products: true,
        },
      },
    },
  });

  if (!order) {
    return notFound();
  }

  // Filtrar productos únicos (si compró 2 del mismo, solo califica una vez)
  // Y mapear a estructura simple para el cliente
  const uniqueProductsMap = new Map();

  order.order_items.forEach((item) => {
    if (!uniqueProductsMap.has(item.productId)) {
      // images is now a native String[] from Postgres
      const image = Array.isArray(item.products.images)
        ? (item.products.images[0] ?? "")
        : "";

      uniqueProductsMap.set(item.productId, {
        id: item.productId,
        name: item.products.name,
        image: image,
      });
    }
  });

  const uniqueProducts = Array.from(uniqueProductsMap.values());

  return (
    <div className="min-h-screen surface bg-gray-50/50">
      <OrderReviewForm
        orderId={order.id}
        customerName={order.customerName}
        products={uniqueProducts}
      />
    </div>
  );
}
