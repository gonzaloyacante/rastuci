import { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutPageSkeleton } from "@/components/public/skeletons";

import CheckoutPageClient from "./client-page";

export const metadata: Metadata = {
  title: "Checkout - Finalizar Compra | Rastuci",
  description:
    "Finaliza tu compra de forma segura con MercadoPago. Pago 100% seguro.",
  keywords: "checkout, pago, mercadopago, compra segura, finalizar compra",
  openGraph: {
    title: "Checkout - Finalizar Compra | Rastuci",
    description: "Finaliza tu compra de forma segura con MercadoPago.",
    type: "website",
  },
  alternates: {
    canonical: "/finalizar-compra",
  },
  robots: {
    index: false, // No indexar página de checkout por privacidad
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutPageClient />
    </Suspense>
  );
}
