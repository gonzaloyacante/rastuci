"use client";

import {
  CheckoutStepper,
  CustomerInfoStep,
  OrderConfirmation,
  PaymentStep,
  ReviewStep,
  ShippingStep,
} from "@/app/(public)/checkout/components";
import { Spinner } from "@/components/ui/Spinner";
import { useCart } from "@/context/CartContext";
import { useShippingSettings } from "@/hooks/useShippingSettings";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

export enum CheckoutStep {
  CUSTOMER_INFO = 0,
  PAYMENT = 1,
  SHIPPING = 2,
  REVIEW = 3,
  CONFIRMATION = 4,
}

const stepLabels = [
  "Datos Personales",
  "Método de Pago",
  "Envío",
  "Revisar",
  "Confirmación",
];

export default function CheckoutPageClient() {
  const router = useRouter();
  const { cartItems, placeOrder, getCartTotal } = useCart();
  const { shipping: shippingSettings } = useShippingSettings();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(
    CheckoutStep.CUSTOMER_INFO
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = useMemo(() => getCartTotal(), [getCartTotal]);
  const shippingCost = 0; // El costo de envío se calcula en el paso de envío
  const total = useMemo(
    () => subtotal + shippingCost,
    [subtotal, shippingCost]
  );

  // Check if cart is empty and redirect
  useEffect(() => {
    const checkCartTimer = setTimeout(() => {
      if (cartItems.length === 0 && currentStep !== CheckoutStep.CONFIRMATION) {
        toast.error("Tu carrito está vacío");
        router.push("/carrito");
      }
    }, 300);
    return () => clearTimeout(checkCartTimer);
  }, [cartItems, router, currentStep]);

  const goToNextStep = useCallback(() => {
    if (currentStep < CheckoutStep.CONFIRMATION) {
      setCurrentStep((prev) => (prev + 1) as CheckoutStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > CheckoutStep.CUSTOMER_INFO) {
      setCurrentStep((prev) => (prev - 1) as CheckoutStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: CheckoutStep) => {
      // Only allow going to previous steps
      if (step < currentStep) {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep]
  );

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await placeOrder();

      if (result.success) {
        // Handle MercadoPago redirect
        if (result.paymentMethod === "mercadopago" && result.redirectUrl) {
          toast.success("Redirigiendo a MercadoPago...");
          window.location.href = result.redirectUrl;
          return;
        }

        // Handle successful order
        if (result.orderId) {
          setOrderId(result.orderId);
          setCurrentStep(CheckoutStep.CONFIRMATION);
          toast.success("¡Pedido realizado con éxito!");
        }
      } else {
        const errorMessage =
          result.error || "Ocurrió un error al procesar tu pedido.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado. Por favor intenta nuevamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error("Error al finalizar la compra:", { error: error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case CheckoutStep.CUSTOMER_INFO:
        return <CustomerInfoStep onNext={goToNextStep} />;
      case CheckoutStep.PAYMENT:
        return <PaymentStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case CheckoutStep.SHIPPING:
        return <ShippingStep onNext={goToNextStep} onBack={goToPreviousStep} />;
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

  // Show loading if cart items are being loaded
  if (cartItems.length === 0 && currentStep !== CheckoutStep.CONFIRMATION) {
    return (
      <div className="surface text-primary min-h-screen flex flex-col">
        <main className="grow max-w-[1200px] mx-auto py-8 px-6 w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="muted">Verificando carrito...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="surface text-primary min-h-screen flex flex-col">
      <main className="grow max-w-[1200px] mx-auto py-8 px-6 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary font-montserrat">
            Finalizar Compra
          </h1>
          <div className="text-right">
            <p className="text-sm muted">Total a pagar</p>
            <p className="text-2xl font-bold text-primary">
              {total.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </p>
          </div>
        </div>

        <CheckoutStepper currentStep={currentStep} onStepClick={goToStep} />

        <div className="my-8">{renderCurrentStep()}</div>

        {/* Progress indicator */}
        {currentStep !== CheckoutStep.CONFIRMATION && (
          <div className="mt-8 text-center">
            <p className="text-sm muted">
              Paso {currentStep + 1} de {stepLabels.length}
            </p>
            <div className="w-full bg-surface-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / stepLabels.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Security badges */}
        <div className="mt-8 text-center border-t border-muted pt-6">
          <div className="flex justify-center items-center gap-6 text-sm muted">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Pago 100% seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {shippingSettings.freeShipping
                  ? shippingSettings.freeShippingLabel
                  : shippingSettings.estimatedDelivery}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span>MercadoPago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
