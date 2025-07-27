"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, placeOrder } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(
    CheckoutStep.CUSTOMER_INFO
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

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

  // Nombres de los pasos
  const stepNames = [
    "Información Personal",
    "Envío",
    "Método de Pago",
    "Facturación",
    "Revisar Pedido",
    "Confirmación",
  ];

  // Avanzar al siguiente paso
  const goToNextStep = () => {
    setCurrentStep((prevStep) => (prevStep + 1) as CheckoutStep);
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
    <div className="bg-white text-[#333333] min-h-screen flex flex-col">
      <main className="flex-grow max-w-[1200px] mx-auto py-8 px-6 w-full">
        {currentStep !== CheckoutStep.CONFIRMATION ? (
          <>
            <h1 className="text-3xl font-bold text-[#333333] mb-8">Checkout</h1>

            {/* Indicador de progreso */}
            <div className="mb-10">
              <div className="flex justify-between items-center">
                {stepNames.slice(0, stepNames.length - 1).map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${
                      index < stepNames.length - 1 ? "w-full relative" : ""
                    }`}
                    onClick={() => goToStep(index as CheckoutStep)}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index <= currentStep
                          ? "bg-[#E91E63] text-white"
                          : "bg-gray-200 text-gray-600"
                      } ${index < currentStep ? "cursor-pointer" : ""} z-10`}>
                      {index + 1}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        index <= currentStep
                          ? "text-[#333333] font-medium"
                          : "text-gray-500"
                      } ${index < currentStep ? "cursor-pointer" : ""}`}>
                      {step}
                    </span>
                    {index < stepNames.length - 2 && (
                      <div
                        className={`absolute top-5 w-full h-[2px] ${
                          index < currentStep ? "bg-[#E91E63]" : "bg-gray-200"
                        }`}
                        style={{ left: "50%" }}></div>
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
                className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                <ChevronLeft className="mr-2" size={16} />
                Volver
              </Button>
              <Button
                onClick={goToNextStep}
                className="bg-[#E91E63] text-white hover:bg-[#C2185B]">
                Continuar
                <ChevronRight className="ml-2" size={16} />
              </Button>
            </div>
          )}
      </main>
    </div>
  );
}
