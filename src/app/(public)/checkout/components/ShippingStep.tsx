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
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Store,
  Truck,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

// ============================================================================
// HELPER FUNCTIONS (fuera del componente)
// ============================================================================

/** Crear opciones de envío de fallback */
function createFallbackShippingOptions(type: "D" | "S"): ShippingOption[] {
  if (type === "D") {
    return [
      {
        id: "standard-home",
        name: "Envío Estándar a Domicilio",
        description:
          "Correo Argentino - Entrega en tu domicilio (precio estimado)",
        price: 4500,
        estimatedDays: "5-7 días hábiles",
        isFallback: true,
      },
      {
        id: "express-home",
        name: "Envío Express a Domicilio",
        description: "Correo Argentino - Entrega rápida (precio estimado)",
        price: 7000,
        estimatedDays: "2-3 días hábiles",
        isFallback: true,
      },
    ];
  }
  return [
    {
      id: "standard-agency",
      name: "Envío a Sucursal",
      description:
        "Retirá en la sucursal de Correo Argentino (precio estimado)",
      price: 3500,
      estimatedDays: "5-7 días hábiles",
      isFallback: true,
    },
  ];
}

/** Crear opción de retiro en local */
function createPickupOption(): ShippingOption {
  return {
    id: "pickup",
    name: "Retiro en Local",
    description: "Gratis en nuestro local",
    price: 0,
    estimatedDays: "Inmediato",
    isFallback: false,
  };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

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
    selectedPaymentMethod,
    selectedAgency,
    setSelectedAgency,
  } = useCart();

  // Estado local
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("home");
  
  // 🚀 CACHÉ: Guardar opciones de envío previamente calculadas - useRef persiste entre renders
  const cachedOptionsRef = useRef<{
    home?: ShippingOption[];
    agency?: ShippingOption[];
  }>({});

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Limpiar agencia seleccionada si cambia el modo
  useEffect(() => {
    if (deliveryMode !== "agency") {
      setSelectedAgency(null);
    }
  }, [deliveryMode, setSelectedAgency]);

  // Autoseleccionar opción de pickup cuando se selecciona ese modo
  useEffect(() => {
    if (deliveryMode === "pickup") {
      const pickupOption = createPickupOption();
      setShippingOptions([pickupOption]);
      setSelectedShippingOption(pickupOption);
      setError(null);
    }
  }, [deliveryMode, setSelectedShippingOption]);

  // Calcular costos de envío - CON CACHÉ OPTIMIZADO
  useEffect(() => {
    // Si es retiro en tienda (local), ya se maneja en otro useEffect
    if (deliveryMode === "pickup") {
      return;
    }

    // Si no hay código postal, no calcular
    if (!customerInfo?.postalCode) {
      setError("Se requiere código postal para calcular el envío");
      return;
    }

    // Si es agencia pero no hay agencia seleccionada, no calcular aún
    if (deliveryMode === "agency" && !selectedAgency) {
      setShippingOptions([]);
      setError(null);
      return;
    }

    const mode = deliveryMode === "agency" ? "agency" : "home";
    
    // 🚀 Verificar si ya tenemos opciones en caché para este modo
    const cached = cachedOptionsRef.current[mode];
    if (cached && cached.length > 0) {
      setShippingOptions(cached);
      // Si no hay opción seleccionada o no está en las nuevas opciones, seleccionar la primera
      if (!selectedShippingOption || !cached.find(o => o.id === selectedShippingOption.id)) {
        setSelectedShippingOption(cached[0]);
      }
      return; // ✅ Usar datos cacheados, no hacer llamada API
    }

    const fetchShippingOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const type = deliveryMode === "agency" ? "S" : "D";
        const options = await calculateShippingCost(
          customerInfo.postalCode,
          type
        );

        if (options && options.length > 0) {
          setShippingOptions(options);
          // 🚀 Guardar en caché (useRef persiste entre renders)
          cachedOptionsRef.current = { ...cachedOptionsRef.current, [mode]: options };
          // Seleccionar la primera opción automáticamente
          setSelectedShippingOption(options[0]);
        } else {
          // Usar fallback si no hay opciones
          const fallbackOptions = createFallbackShippingOptions(type);
          setShippingOptions(fallbackOptions);
          cachedOptionsRef.current = { ...cachedOptionsRef.current, [mode]: fallbackOptions };
          setSelectedShippingOption(fallbackOptions[0]);
        }
      } catch (err) {
        logger.error("Error al calcular envío:", { err });
        // En caso de error, usar opciones de fallback
        const type = deliveryMode === "agency" ? "S" : "D";
        const fallbackOptions = createFallbackShippingOptions(type);
        setShippingOptions(fallbackOptions);
        cachedOptionsRef.current = { ...cachedOptionsRef.current, [mode]: fallbackOptions };
        setSelectedShippingOption(fallbackOptions[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerInfo?.postalCode, deliveryMode, selectedAgency]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectOption = (option: ShippingOption) => {
    setSelectedShippingOption(option);
  };

  const handleContinue = () => {
    if (selectedShippingOption) {
      onNext();
    } else {
      setError("Por favor, selecciona una opción de envío para continuar");
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderShippingOptions = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 sm:py-10">
          <Loader2
            size={32}
            className="animate-spin text-primary mb-3 sm:mb-4 sm:w-10 sm:h-10"
          />
          <p className="text-muted-foreground text-sm sm:text-base">
            Calculando opciones de envío...
          </p>
        </div>
      );
    }

    // Si es modo agencia y no hay agencia seleccionada
    if (deliveryMode === "agency" && !selectedAgency) {
      return (
        <div className="text-center py-6 sm:py-8 text-muted-foreground border border-dashed border-muted rounded-lg text-sm sm:text-base">
          <MapPin className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
          Selecciona una sucursal para ver los costos de envío.
        </div>
      );
    }

    // Si no hay opciones (solo para home/agency, pickup siempre tiene)
    if (shippingOptions.length === 0 && deliveryMode !== "pickup") {
      return (
        <div className="text-center py-6 sm:py-8 text-muted-foreground border border-dashed border-muted rounded-lg text-sm sm:text-base">
          <Truck className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
          {deliveryMode === "home"
            ? "No hay opciones de envío a domicilio disponibles."
            : "No hay opciones de envío a sucursal disponibles."}
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-4 sm:mt-6">
        {/* Indicador de origen de datos */}
        {shippingOptions.length > 0 && (
          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${
              shippingOptions[0]?.isFallback
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {shippingOptions[0]?.isFallback ? (
              <>
                <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                <span>Precios estimados</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">
                  Precios actualizados de Correo Argentino
                </span>
                <span className="xs:hidden">Precios actualizados</span>
              </>
            )}
          </div>
        )}

        {shippingOptions.map((option) => {
          const disabled =
            String(selectedPaymentMethod) === "cash" && option.id !== "pickup";
          const isSelected = selectedShippingOption?.id === option.id;

          return (
            <div
              key={option.id}
              className={`border rounded-lg p-3 sm:p-4 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-muted surface hover:border-primary/50 hover:bg-muted/30"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !disabled && handleSelectOption(option)}
            >
              {/* Layout mobile: stack vertical */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  {option.id === "pickup" ? (
                    <Store
                      size={20}
                      className={`mt-2.5 shrink-0 sm:w-10 sm:h-10 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                  ) : deliveryMode === "agency" ? (
                    <MapPin
                      size={20}
                      className={`mt-2.5 shrink-0 sm:w-10 sm:h-10 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                  ) : (
                    <Truck
                      size={20}
                      className={`mt-2.5 shrink-0 sm:w-10 sm:h-10 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-md sm:text-base leading-tight">
                      {option.name}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-sm line-clamp-2 sm:line-clamp-none">
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* Precio y check - en mobile va abajo a la derecha */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-7 sm:pl-0">
                  <span className="font-bold text-base sm:text-lg">
                    {option.price === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      formatPriceARS(option.price)
                    )}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check size={14} className="text-white sm:w-4 sm:h-4" />
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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-3xl mx-auto px-0 sm:px-4">
      <div className="surface p-4 sm:p-6 rounded-lg shadow-sm border border-muted">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">
          Entrega / Retiro
        </h2>

        {/* Resumen de dirección - más compacto en mobile */}
        {customerInfo && (
          <div className="surface p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-muted">
            <div className="flex items-start gap-2 sm:gap-3">
              <MapPin
                size={18}
                className="text-muted-foreground mt-0.5 shrink-0 hidden sm:block"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base truncate">
                  {customerInfo.name}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm truncate">
                  {customerInfo.address}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {customerInfo.city}, {customerInfo.province}, CP:{" "}
                  {customerInfo.postalCode}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {customerInfo.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selector de Método de Entrega */}
        <div className="mb-6 sm:mb-8">
          <ShippingMethodSelector
            value={deliveryMode}
            onChange={setDeliveryMode}
          />
        </div>

        {/* Selector de Agencia (solo si es retiro en sucursal) */}
        {deliveryMode === "agency" && (
          <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Selecciona una sucursal
            </h3>
            <AgencySelector
              selectedAgency={selectedAgency}
              onSelectAgency={setSelectedAgency}
              initialProvince={customerInfo?.province}
              initialPostalCode={customerInfo?.postalCode}
            />
          </div>
        )}

        {/* Aviso: si el pago es en efectivo, solo retiro está disponible */}
        {String(selectedPaymentMethod) === "cash" &&
          deliveryMode !== "pickup" && (
            <div className="mb-4 p-3 rounded-md surface-secondary border border-muted text-primary text-sm">
              Has seleccionado <strong>Pago en efectivo</strong>. El envío a
              domicilio no está disponible para este método de pago. Solo está
              disponible la opción de <strong>Retiro en local</strong>.
            </div>
          )}

        {/* Mensaje de error */}
        {error && (
          <div className="surface border border-error text-error p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Opciones de envío calculadas */}
        {renderShippingOptions()}

        {/* Botones de navegación - full width en mobile */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 sm:mt-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="surface text-primary hover:brightness-95 w-full sm:w-auto"
            leftIcon={<ChevronLeft size={16} />}
          >
            Volver
          </Button>
          <Button
            onClick={handleContinue}
            disabled={
              !selectedShippingOption ||
              loading ||
              (deliveryMode === "agency" && !selectedAgency)
            }
            className="btn-hero w-full sm:w-auto"
            rightIcon={<ChevronRight size={16} />}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
