"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Spinner } from "@/components/ui/Spinner";

import {
  ContactSupportCard,
  ErrorDetailCard,
  FailureActions,
  PaymentMethodsCard,
} from "./failureUtils";

function CheckoutFailureContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>("");
  const [errorReason, setErrorReason] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id =
      searchParams.get("order_id") ||
      searchParams.get("external_reference") ||
      "";
    const reason =
      searchParams.get("reason") || searchParams.get("status_detail") || "";
    setOrderId(id);
    setErrorReason(reason);
    setMounted(true);
  }, [searchParams]);

  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <XCircle className="w-20 h-20 text-error mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-2">
            Pago Rechazado
          </h1>
          <p className="muted">
            {mounted && orderId && !orderId.startsWith("tmp_")
              ? `Referencia: #${orderId}`
              : "Referencia: Pago no procesado"}
          </p>
        </div>

        <ErrorDetailCard errorReason={errorReason} />
        <PaymentMethodsCard />
        <FailureActions />
        <ContactSupportCard />

        <div className="mt-8 text-center text-sm muted">
          <p>
            Los pagos son procesados de forma segura por MercadoPago.{" "}
            <Link href="/politicas" className="text-primary hover:underline">
              Política de privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading component para Suspense
function CheckoutFailureLoading() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="muted">Cargando información del pago...</p>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<CheckoutFailureLoading />}>
      <CheckoutFailureContent />
    </Suspense>
  );
}
