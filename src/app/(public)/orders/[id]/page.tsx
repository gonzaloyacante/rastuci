import { OrderTracking } from "@/components/orders/OrderTracking";
import { notFound } from "next/navigation";

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  // Validar que el ID no esté vacío
  if (!id || id.trim().length === 0) {
    notFound();
  }

  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <OrderTracking orderId={id} />
      </div>
    </div>
  );
}
