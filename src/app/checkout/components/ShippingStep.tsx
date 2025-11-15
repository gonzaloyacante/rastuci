"use client";

import { Button } from "@/components/ui/Button";
import { ShippingOption, useCart } from "@/context/CartContext";
import { logger } from "@/lib/logger";
import { formatPriceARS } from "@/utils/formatters";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ShippingStep({ onNext, onBack }: ShippingStepProps) {
  const {
    customerInfo,
    selectedShippingOption,
    setSelectedShippingOption,
    calculateShippingCost: _calculateShippingCost,
    availableShippingOptions,
    selectedPaymentMethod,
  } = useCart();

  // Estado local
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);

  // Calcular costos de envío según código postal usando Correo Argentino
  const calculateShippingByPostalCode = useCallback(async () => {
    if (!customerInfo?.postalCode) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar a la API de Correo Argentino (simulada)
      const response = await fetch("/api/shipping/correo-argentino/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postalCode: customerInfo.postalCode,
          weight: 1000, // 1kg por defecto
          dimensions: {
            height: 10,
            width: 20,
            length: 30,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error calculando el envío");
      }

      const options = result.data.options;
      setShippingOptions(options);

      // Si no hay opción seleccionada, seleccionar la primera por defecto
      if (!selectedShippingOption && options.length > 0) {
        setSelectedShippingOption(options[0]);
      }
    } catch (error) {
      logger.error("Error al calcular el costo de envío:", { error: error });
      setError(
        "No se pudo calcular el costo de envío. Por favor verifica el código postal."
      );
      // Usar opciones predeterminadas en caso de error
      setShippingOptions(availableShippingOptions);
    } finally {
      setLoading(false);
    }
  }, [
    customerInfo?.postalCode,
    selectedShippingOption,
    setSelectedShippingOption,
    availableShippingOptions,
  ]);

  // Cargar opciones de envío SOLO cuando cambia el código postal
  useEffect(() => {
    if (customerInfo?.postalCode) {
      calculateShippingByPostalCode();
    } else {
      // Si no hay código postal, usar opciones predeterminadas
      setShippingOptions(availableShippingOptions);
    }
  }, [
    customerInfo?.postalCode,
    calculateShippingByPostalCode,
    availableShippingOptions,
  ]);

  // Manejar selección de opción de envío
  const handleSelectOption = (option: ShippingOption) => {
    setSelectedShippingOption(option);
  };

  // Manejar continuar al siguiente paso
  const handleContinue = () => {
    if (selectedShippingOption) {
      onNext();
    } else {
      setError("Por favor, selecciona una opción de envío para continuar");
    }
  };

  // Renderizar las opciones de envío
  const renderShippingOptions = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p>Calculando opciones de envío...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-6">
        {shippingOptions.map((option) => {
          const disabled =
            String(selectedPaymentMethod) === "cash" && option.id !== "pickup";

          return (
            <div
              key={option.id}
              className={`border rounded-lg p-4 transition-all ${
                selectedShippingOption?.id === option.id
                  ? "border-primary surface"
                  : "border-muted surface"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}`}
              onClick={() => !disabled && handleSelectOption(option)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  {option.id === "pickup" ? (
                    <MapPin
                      size={24}
                      className={`mt-1 ${
                        selectedShippingOption?.id === option.id
                          ? "text-primary"
                          : "muted"
                      }`}
                    />
                  ) : (
                    <Truck
                      size={24}
                      className={`mt-1 ${
                        selectedShippingOption?.id === option.id
                          ? "text-primary"
                          : "muted"
                      }`}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{option.name}</h3>
                    <p className="muted text-sm">{option.description}</p>
                    <p className="muted text-sm mt-1">
                      Tiempo estimado: {option.estimatedDays}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">
                    {option.price === 0
                      ? "Gratis"
                      : formatPriceARS(option.price)}
                  </span>
                  {selectedShippingOption?.id === option.id && (
                    <div className="w-6 h-6 rounded-full btn-hero flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="surface p-6 rounded-lg shadow-sm border border-muted">
        <h2 className="text-2xl font-bold mb-2 text-primary">
          Entrega / Retiro
        </h2>

        {/* Resumen de dirección */}
        {customerInfo && (
          <div className="surface p-4 rounded-lg mb-6 border border-muted">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="muted mt-1" />
              <div>
                <p className="font-medium">{customerInfo.name}</p>
                <p className="muted text-sm">{customerInfo.address}</p>
                <p className="muted text-sm">
                  {customerInfo.city}, {customerInfo.province}, CP:{" "}
                  {customerInfo.postalCode}
                </p>
                <p className="muted text-sm">{customerInfo.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Aviso: si el pago es en efectivo, solo retiro está disponible */}
        {String(selectedPaymentMethod) === "cash" && (
          <div className="mb-4 p-3 rounded-md surface-secondary border border-muted text-primary">
            Has seleccionado <strong>Pago en efectivo</strong>. El envío a
            domicilio no está disponible para este método de pago. Solo está
            disponible la opción de <strong>Retiro en local</strong>. Las demás
            opciones aparecen deshabilitadas.
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="surface border border-error text-error p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Opciones de envío */}
        {renderShippingOptions()}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="surface text-primary hover:brightness-95"
          >
            <ChevronLeft className="mr-2" size={16} />
            Volver
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedShippingOption || loading}
            className="btn-hero"
          >
            Continuar
            <ChevronRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
