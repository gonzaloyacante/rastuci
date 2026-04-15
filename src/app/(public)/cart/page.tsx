import { Metadata } from "next";
import { Suspense } from "react";

import { CartPageSkeleton } from "@/components/public/skeletons";

import CartPageClient from "./client-page";

export const metadata: Metadata = {
  title: "Carrito de Compras - Rastuci",
  description:
    "Revisa y gestiona los productos en tu carrito de compras. Procede al checkout cuando estés listo.",
  keywords: "carrito, compras, checkout, productos, pago",
  openGraph: {
    title: "Carrito de Compras - Rastuci",
    description: "Gestiona tu carrito de compras y procede al checkout.",
    type: "website",
  },
  alternates: {
    canonical: "/carrito",
  },
};

export default function CartPage() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPageClient />
    </Suspense>
  );
}
