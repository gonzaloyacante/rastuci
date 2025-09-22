"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Importaciones estáticas usando el archivo de índice
import {
  CustomerInfoStep,
  ShippingStep,
  PaymentStep,
  BillingStep,
  ReviewStep,
  OrderConfirmation,
} from "@/app/checkout/components";

// Enumeración de los pasos del checkout
enum CheckoutStep {
  CUSTOMER_INFO = 0,
  SHIPPING = 1,
  PAYMENT = 2,
  BILLING = 3,
  REVIEW = 4,
  CONFIRMATION = 5,
}

// Componente que usa useSearchParams
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    cartItems,
    placeOrder,
    getOrderSummary,
    selectedPaymentMethod,
    clearCart,
  } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(
    CheckoutStep.CUSTOMER_INFO,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<
    "success" | "failure" | "pending" | null
  >(null);

  // Redireccionar si el carrito está vacío
  useEffect(() => {
    // Agregamos un pequeño retraso para asegurar que el carrito se ha cargado
    const checkCartTimer = setTimeout(() => {
      if (cartItems.length === 0 && currentStep !== CheckoutStep.CONFIRMATION) {
        router.push("/carrito");
      }
    }, 300); // 300ms de retraso

    return () => clearTimeout(checkCartTimer);
  }, [cartItems, router, currentStep]);

  // Manejar retorno desde Mercado Pago con ?status=
  useEffect(() => {
    const status = searchParams?.get("status");
    if (!status) return;

    if (status === "success") {
      setStatusType("success");
      setStatusMessage("Pago aprobado. ¡Gracias por tu compra!");
      // Limpiar carrito y mostrar confirmación
      clearCart();
      setCurrentStep(CheckoutStep.CONFIRMATION);
    } else if (status === "pending") {
      setStatusType("pending");
      setStatusMessage("Pago pendiente. Te avisaremos cuando se acredite.");
      // Mantenerse en Review para permitir reintentar
      setCurrentStep(CheckoutStep.REVIEW);
    } else if (status === "failure") {
      setStatusType("failure");
      setStatusMessage(
        "El pago fue rechazado o cancelado. Intenta nuevamente.",
      );
      setCurrentStep(CheckoutStep.REVIEW);
    }
    // Limpiar el parámetro visualmente (opcional): router.replace('/checkout')
    // router.replace('/checkout');
  }, [
    searchParams,
    clearCart,
    setCurrentStep,
    setStatusType,
    setStatusMessage,
  ]);

  // Nombres de los pasos
  // Omitimos el paso de "Método de Pago" porque usaremos siempre Mercado Pago (Checkout Pro)
  const visibleSteps: CheckoutStep[] = [
    CheckoutStep.CUSTOMER_INFO,
    CheckoutStep.SHIPPING,
    CheckoutStep.BILLING,
    CheckoutStep.REVIEW,
    CheckoutStep.CONFIRMATION,
  ];

  const stepNames = [
    "Información Personal",
    "Envío",
    "Facturación",
    "Revisar Pedido",
    "Confirmación",
  ];

  // Avanzar al siguiente paso
  const goToNextStep = () => {
    setCurrentStep((prevStep) => {
      // Saltar PAYMENT
      if (prevStep === CheckoutStep.SHIPPING) return CheckoutStep.BILLING;
      return (prevStep + 1) as CheckoutStep;
    });
    window.scrollTo(0, 0);
  };

  // Retroceder al paso anterior
  const goToPreviousStep = () => {
    setCurrentStep((prevStep) => (prevStep - 1) as CheckoutStep);
    window.scrollTo(0, 0);
  };

  // Ir a un paso específico
  const goToStep = (step: CheckoutStep) => {
    // Solo permitir ir a pasos anteriores, no saltar hacia adelante
    if (step < currentStep) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };

  // Manejar la finalización del pedido
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Si el usuario eligió MercadoPago, creamos la preferencia y redirigimos a Checkout Pro
      if (selectedPaymentMethod?.id === "mercadopago") {
        const summary = getOrderSummary();

        // Aplicar descuento (si existe) sólo sobre productos, no sobre el envío
        const discountRate =
          summary.subtotal > 0 ? summary.discount / summary.subtotal : 0;

        const items = summary.items.map((it) => ({
          title: `${it.product.name} (${it.size} - ${it.color})`,
          quantity: it.quantity,
          unit_price: Number(
            (it.product.price * (1 - discountRate)).toFixed(2),
          ),
          currency_id: "ARS",
          picture_url: Array.isArray(it.product.images)
            ? it.product.images[0]
            : undefined,
          description: it.product.description || undefined,
        }));

        // Agregar ítem de envío si corresponde (sin descuento)
        if ((summary.shippingCost || 0) > 0) {
          items.push({
            title: `Envío - ${summary.shippingOption?.name || "Envío"}`,
            quantity: 1,
            unit_price: Number(summary.shippingCost.toFixed(2)),
            currency_id: "ARS",
            picture_url: undefined,
            description: summary.shippingOption?.description || undefined,
          });
        }

        const customer = summary.customer
          ? {
              name: summary.customer.name,
              email: summary.customer.email,
              phone: summary.customer.phone,
              address: summary.customer.address,
              city: summary.customer.city,
              postalCode: summary.customer.postalCode,
            }
          : null;

        const discountPercent =
          summary.subtotal > 0 ? summary.discount / summary.subtotal : 0;
        const metadata = {
          shipping: summary.shippingOption?.id,
          billing: summary.billing?.id,
          discountPercent,
          // Información para validación server-side y construcción de orden en webhook
          items: summary.items.map((it) => ({
            productId: it.product.id,
            quantity: it.quantity,
            size: it.size,
            color: it.color,
          })),
        };

        const res = await fetch("/api/payments/mercadopago/preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, customer, metadata }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err?.error || "No se pudo crear la preferencia de Mercado Pago",
          );
        }

        const data = await res.json();
        if (!data?.init_point) {
          throw new Error("Respuesta inválida de Mercado Pago");
        }

        // Redirigir al checkout alojado de Mercado Pago
        window.location.href = data.init_point as string;
        return;
      }

      // Flujo anterior por defecto (otros métodos de pago)
      const result = await placeOrder();

      if (result.success) {
        setOrderId(result.orderId);
        setCurrentStep(CheckoutStep.CONFIRMATION);
      } else {
        setError(result.error || "Ocurrió un error al procesar tu pedido.");
      }
    } catch (error) {
      setError("Ocurrió un error inesperado. Por favor intenta nuevamente.");
      console.error("Error al finalizar la compra:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case CheckoutStep.CUSTOMER_INFO:
        return <CustomerInfoStep onNext={goToNextStep} />;
      case CheckoutStep.SHIPPING:
        return <ShippingStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case CheckoutStep.PAYMENT:
        return <PaymentStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case CheckoutStep.BILLING:
        return <BillingStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case CheckoutStep.REVIEW:
        return (
          <ReviewStep
            onPlaceOrder={handlePlaceOrder}
            onBack={goToPreviousStep}
            isSubmitting={isSubmitting}
            error={error}
          />
        );
      case CheckoutStep.CONFIRMATION:
        return <OrderConfirmation orderId={orderId} />;
      default:
        return <CustomerInfoStep onNext={goToNextStep} />;
    }
  };

  return (
    <div className="surface text-primary min-h-screen flex flex-col">
      <main className="flex-grow max-w-[1200px] mx-auto py-8 px-6 w-full">
        {statusMessage && (
          <div
            className={`mb-6 rounded-md p-4 text-sm surface border ${
              statusType === "success"
                ? "text-success border-success"
                : statusType === "pending"
                  ? "text-warning border-warning"
                  : "text-error border-error"
            }`}
          >
            {statusMessage}
          </div>
        )}
        {currentStep !== CheckoutStep.CONFIRMATION ? (
          <>
            <h1 className="text-3xl font-bold text-primary mb-8">Checkout</h1>

            {/* Indicador de progreso (sin Paso de Pago) */}
            <div className="mb-10">
              <div className="flex justify-between items-center">
                {stepNames.slice(0, stepNames.length - 1).map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${
                      index < stepNames.length - 1 ? "w-full relative" : ""
                    }`}
                    onClick={() => goToStep(visibleSteps[index])}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        // Considerar la posición real del paso visible respecto al currentStep
                        visibleSteps[index] <= currentStep
                          ? "bg-primary text-white"
                          : "surface muted"
                      } ${visibleSteps[index] < currentStep ? "cursor-pointer" : ""} z-10`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        visibleSteps[index] <= currentStep
                          ? "text-primary font-medium"
                          : "muted"
                      } ${visibleSteps[index] < currentStep ? "cursor-pointer" : ""}`}
                    >
                      {step}
                    </span>
                    {index < stepNames.length - 2 && (
                      <div
                        className={`absolute top-5 w-full h-[2px] ${
                          visibleSteps[index] < currentStep
                            ? "bg-primary"
                            : "surface"
                        }`}
                        style={{ left: "50%" }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {/* Contenido del paso actual */}
        <div className="my-8">{renderCurrentStep()}</div>

        {/* Botones de navegación (excepto en la confirmación) */}
        {currentStep !== CheckoutStep.CONFIRMATION &&
          currentStep !== CheckoutStep.CUSTOMER_INFO &&
          currentStep !== CheckoutStep.REVIEW && (
            <div className="flex justify-between mt-10">
              <Button
                onClick={goToPreviousStep}
                className="surface text-primary hover:brightness-95"
              >
                <ChevronLeft className="mr-2" size={16} />
                Volver
              </Button>
              <Button
                onClick={goToNextStep}
                className="bg-primary text-white hover:brightness-90"
              >
                Continuar
                <ChevronRight className="ml-2" size={16} />
              </Button>
            </div>
          )}
      </main>
    </div>
  );
}

// Componente principal con Suspense
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="muted">Cargando checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
