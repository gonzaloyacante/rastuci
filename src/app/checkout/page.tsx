"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  CustomerInfoStep,
  // ShippingStep, // COMENTADO: Envíos deshabilitados temporalmente - falta API Correo Argentino
  PaymentStep,
  ReviewStep,
  OrderConfirmation,
} from "@/app/checkout/components";
import CheckoutStepper from "@/app/checkout/components/CheckoutStepper";

enum CheckoutStep {
  CUSTOMER_INFO = 0,
  // SHIPPING = 1, // COMENTADO: Envíos deshabilitados temporalmente
  PAYMENT = 2,
  REVIEW = 3,
  CONFIRMATION = 4,
}

function CheckoutContent() {
  const router = useRouter();
  const { cartItems, placeOrder } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.CUSTOMER_INFO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkCartTimer = setTimeout(() => {
      if (cartItems.length === 0 && currentStep !== CheckoutStep.CONFIRMATION) {
        router.push("/carrito");
      }
    }, 300);
    return () => clearTimeout(checkCartTimer);
  }, [cartItems, router, currentStep]);

  const goToNextStep = () => {
    setCurrentStep((prevStep) => (prevStep + 1) as CheckoutStep);
    window.scrollTo(0, 0);
  };

  const goToPreviousStep = () => {
    setCurrentStep((prevStep) => (prevStep - 1) as CheckoutStep);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await placeOrder();
      if (result.success) {
        if (result.paymentMethod === "mercadopago" && result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return;
        }
        if (result.orderId) {
          setOrderId(result.orderId);
          setCurrentStep(CheckoutStep.CONFIRMATION);
        }
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case CheckoutStep.CUSTOMER_INFO:
        return <CustomerInfoStep onNext={goToNextStep} />;
      // case CheckoutStep.SHIPPING: // COMENTADO: Envíos deshabilitados temporalmente
      //   return <ShippingStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case CheckoutStep.PAYMENT:
        return <PaymentStep onNext={goToNextStep} onBack={goToPreviousStep} />;
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
        <h1 className="text-3xl font-bold text-primary mb-8">Checkout</h1>
        <CheckoutStepper currentStep={currentStep} onStepClick={() => {}} />
        <div className="my-8">{renderCurrentStep()}</div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="surface">Cargando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
