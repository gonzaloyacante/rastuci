import { prisma } from "@/lib/prisma";
import OrderReviewForm from "@/components/reviews/OrderReviewForm";
import { Metadata } from "next";
import { notFound } from "next/navigation";

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
  // Usamos el ID como "token", sin auth de usuario de session
  const order = await prisma.orders.findUnique({
    where: { id },
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
      // Parsear imágenes (pueden venir como string JSON o simple)
      let image = "";
      try {
        const rawImages = item.products.images;
        if (rawImages) {
          // Si es string JSON
          if (typeof rawImages === "string" && rawImages.startsWith("[")) {
            const parsed = JSON.parse(rawImages);
            image = Array.isArray(parsed) ? parsed[0] : image;
          } else {
            // Si es string URL directo
            image = rawImages as string;
          }
        }
      } catch (e) {
        // Fallback
      }

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
