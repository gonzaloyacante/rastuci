"use client";

import { AgencySelector } from "@/components/checkout/AgencySelector";
import {
  DeliveryMode,
  ShippingMethodSelector,
} from "@/components/checkout/ShippingMethodSelector";
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
  Store,
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
    calculateShippingCost,
    // availableShippingOptions is from CartContext but not used directly here
    // It's kept in destructuring for potential future use
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    availableShippingOptions,
    selectedPaymentMethod,
    selectedAgency,
    setSelectedAgency,
  } = useCart();

  // Estado local
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("home");

  // Efecto para limpiar agencia seleccionada si cambia el modo
  useEffect(() => {
    if (deliveryMode !== "agency") {
      setSelectedAgency(null);
    }
  }, [deliveryMode, setSelectedAgency]);

  // Calcular costos de envío
  const calculateShipping = useCallback(async () => {
    if (!customerInfo?.postalCode) {
      return;
    }

    // Si es retiro en tienda (local), mostrar opción estática
    if (deliveryMode === "pickup") {
      const pickupOption: ShippingOption = {
        id: "pickup",
        name: "Retiro en Local",
        description: "Gratis en nuestro local",
        price: 0,
        estimatedDays: "Inmediato",
      };
      setShippingOptions([pickupOption]);
      return;
    }

    // Si es agencia pero no hay agencia seleccionada, no calcular aún
    if (deliveryMode === "agency" && !selectedAgency) {
      setShippingOptions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const type = deliveryMode === "agency" ? "S" : "D";
      // Usar la función del contexto que ya maneja la API
      const options = await calculateShippingCost(
        customerInfo.postalCode,
        type
      );

      if (options.length > 0) {
        setShippingOptions(options);
        // Seleccionar la primera opción por defecto si no hay una seleccionada o si la seleccionada no está en las nuevas opciones
        if (
          !selectedShippingOption ||
          !options.find((o) => o.id === selectedShippingOption.id)
        ) {
          setSelectedShippingOption(options[0]);
        }
      } else {
        setError("No se encontraron opciones de envío para esta ubicación.");
        setShippingOptions([]);
      }
    } catch (error) {
      logger.error("Error al calcular envío:", { error });
      setError("Error al calcular el costo de envío. Intenta nuevamente.");
      setShippingOptions([]);
    } finally {
      setLoading(false);
    }
  }, [
    customerInfo?.postalCode,
    deliveryMode,
    selectedAgency,
    calculateShippingCost,
    setSelectedShippingOption,
    selectedShippingOption,
  ]);

  // Recalcular cuando cambian las dependencias relevantes
  useEffect(() => {
    calculateShipping();
  }, [calculateShipping]);

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

    if (deliveryMode === "agency" && !selectedAgency) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Selecciona una sucursal para ver los costos de envío.
        </div>
      );
    }

    if (shippingOptions.length === 0 && !loading && !error) {
      if (deliveryMode === "home") {
        return (
          <div className="text-center py-8 text-muted-foreground">
            No hay opciones de envío a domicilio disponibles para este código
            postal.
          </div>
        );
      }
      return null;
    }

    return (
      <div className="space-y-4 mt-6">
        {shippingOptions.map((option) => {
          const disabled =
            String(selectedPaymentMethod) === "cash" && option.id !== "pickup";

          return (
            <div
              key={option.id}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${
                selectedShippingOption?.id === option.id
                  ? "border-primary surface ring-1 ring-primary"
                  : "border-muted surface hover:border-primary/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !disabled && handleSelectOption(option)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  {option.id === "pickup" ? (
                    <Store
                      size={24}
                      className={`mt-1 ${
                        selectedShippingOption?.id === option.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ) : deliveryMode === "agency" ? (
                    <MapPin
                      size={24}
                      className={`mt-1 ${
                        selectedShippingOption?.id === option.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ) : (
                    <Truck
                      size={24}
                      className={`mt-1 ${
                        selectedShippingOption?.id === option.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{option.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {option.description}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
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
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
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
        <h2 className="text-2xl font-bold mb-6 text-primary">
          Entrega / Retiro
        </h2>

        {/* Resumen de dirección */}
        {customerInfo && (
          <div className="surface p-4 rounded-lg mb-6 border border-muted">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-muted-foreground mt-1" />
              <div>
                <p className="font-medium">{customerInfo.name}</p>
                <p className="text-muted-foreground text-sm">
                  {customerInfo.address}
                </p>
                <p className="text-muted-foreground text-sm">
                  {customerInfo.city}, {customerInfo.province}, CP:{" "}
                  {customerInfo.postalCode}
                </p>
                <p className="text-muted-foreground text-sm">
                  {customerInfo.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selector de Método de Entrega */}
        <div className="mb-8">
          <ShippingMethodSelector
            value={deliveryMode}
            onChange={setDeliveryMode}
          />
        </div>

        {/* Selector de Agencia (solo si es retiro en sucursal) */}
        {deliveryMode === "agency" && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-semibold mb-4">
              Selecciona una sucursal
            </h3>
            <AgencySelector
              selectedAgency={selectedAgency}
              onSelectAgency={setSelectedAgency}
              initialProvince={customerInfo?.province}
            />
          </div>
        )}

        {/* Aviso: si el pago es en efectivo, solo retiro está disponible */}
        {String(selectedPaymentMethod) === "cash" &&
          deliveryMode !== "pickup" && (
            <div className="mb-4 p-3 rounded-md surface-secondary border border-muted text-primary">
              Has seleccionado <strong>Pago en efectivo</strong>. El envío a
              domicilio no está disponible para este método de pago. Solo está
              disponible la opción de <strong>Retiro en local</strong>.
            </div>
          )}

        {/* Mensaje de error */}
        {error && (
          <div className="surface border border-error text-error p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Opciones de envío calculadas */}
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
            disabled={
              !selectedShippingOption ||
              loading ||
              (deliveryMode === "agency" && !selectedAgency)
            }
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
