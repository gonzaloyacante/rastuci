import { useEffect, useRef, useState } from "react";

import { ShippingOption, useCart } from "@/context/CartContext";
import { logger } from "@/lib/logger";

export type ShippingType = "D" | "S";

export interface ShippingGuardResult {
  skip: boolean;
  postalCode?: string;
  resetOptions?: boolean;
  errorMessage?: string;
}

/** Valida si se puede proceder a calcular opciones de envío y resuelve los parámetros. */
export function resolveShippingFetch(
  deliveryMode: string,
  customerPostalCode: string | undefined,
  agencyPostalCode: string | undefined,
  hasAgency: boolean
): ShippingGuardResult {
  if (deliveryMode === "pickup") return { skip: true };
  if (!customerPostalCode) {
    return {
      skip: true,
      errorMessage: "Se requiere código postal para calcular el envío",
    };
  }
  if (deliveryMode === "agency" && !hasAgency) {
    return { skip: true, resetOptions: true };
  }
  const postalCode =
    deliveryMode === "agency" && agencyPostalCode
      ? agencyPostalCode
      : customerPostalCode;
  return { skip: false, postalCode };
}

/** Crear opciones de envío de fallback */
export function createFallbackShippingOptions(
  type: ShippingType
): ShippingOption[] {
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
export function createPickupOption(): ShippingOption {
  return {
    id: "pickup",
    name: "Retiro en Local",
    description: "Sin cargo",
    price: 0,
    estimatedDays: "Inmediato",
    isFallback: false,
  };
}

/** Filtrar opciones de envío según el modo de entrega */
export function filterOptionsByMode(
  options: ShippingOption[],
  deliveryMode: string
): ShippingOption[] {
  return options.filter((o) => {
    if (deliveryMode === "agency")
      return o.id.includes("-S") || o.name.includes("Sucursal");
    if (deliveryMode === "home")
      return o.id.includes("-D") || o.name.includes("Domicilio");
    return true;
  });
}

export interface FetchShippingParams {
  deliveryMode: string;
  postalCode: string;
  calculateShippingCost: (
    postalCode: string,
    type: ShippingType
  ) => Promise<ShippingOption[] | null>;
  selectedShippingOption: ShippingOption | null;
  setShippingOptions: (options: ShippingOption[]) => void;
  setSelectedShippingOption: (option: ShippingOption) => void;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
}

/** Lógica de fetch de opciones de envío, extraída del componente */
export async function fetchAndSetShippingOptions(
  params: FetchShippingParams
): Promise<void> {
  const {
    deliveryMode,
    postalCode,
    calculateShippingCost,
    selectedShippingOption,
    setShippingOptions,
    setSelectedShippingOption,
    setLoading,
    setError,
  } = params;

  const type: ShippingType = deliveryMode === "agency" ? "S" : "D";

  setLoading(true);
  setError(null);

  try {
    const options = await calculateShippingCost(postalCode, type);

    if (options && options.length > 0) {
      const filtered = filterOptionsByMode(options, deliveryMode);
      setShippingOptions(filtered);

      const needsAutoSelect =
        filtered.length > 0 &&
        (!selectedShippingOption ||
          !filtered.find((o) => o.id === selectedShippingOption.id));

      if (needsAutoSelect) {
        setSelectedShippingOption(filtered[0]);
      }
    } else {
      const fallback = createFallbackShippingOptions(type);
      setShippingOptions(fallback);
      setSelectedShippingOption(fallback[0]);
    }
  } catch (err) {
    logger.error("Error al calcular envío:", { err });
    const fallback = createFallbackShippingOptions(type);
    setShippingOptions(fallback);
    setSelectedShippingOption(fallback[0]);
  } finally {
    setLoading(false);
  }
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export type DeliveryModeType = "home" | "agency" | "pickup";

export interface UseShippingOptionsResult {
  shippingOptions: ShippingOption[];
  loading: boolean;
  error: string | null;
  deliveryMode: DeliveryModeType;
  setDeliveryMode: (mode: DeliveryModeType) => void;
}

export function useShippingOptions(): UseShippingOptionsResult {
  const {
    customerInfo,
    selectedShippingOption,
    setSelectedShippingOption,
    calculateShippingCost,
    selectedAgency,
    setSelectedAgency,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryModeType>("home");

  // Ref to read the current selectedShippingOption inside effects without
  // adding it to the dependency array (avoids the infinite-fetch loop caused
  // by: fetch → setSelectedShippingOption → selectedShippingOption changes →
  // effect re-triggers → fetch again → …)
  const selectedShippingOptionRef = useRef(selectedShippingOption);
  selectedShippingOptionRef.current = selectedShippingOption;

  useEffect(() => {
    if (deliveryMode !== "agency") setSelectedAgency(null);
  }, [deliveryMode, setSelectedAgency]);

  useEffect(() => {
    if (deliveryMode !== "pickup") return;
    const pickupOption = createPickupOption();
    setShippingOptions([pickupOption]);
    setSelectedShippingOption(pickupOption);
    setError(null);
  }, [deliveryMode, setSelectedShippingOption]);

  useEffect(() => {
    const guard = resolveShippingFetch(
      deliveryMode,
      customerInfo?.postalCode,
      selectedAgency?.location?.address?.postalCode,
      !!selectedAgency
    );
    if (guard.skip) {
      if (guard.errorMessage) setError(guard.errorMessage);
      if (guard.resetOptions) {
        setShippingOptions([]);
        setError(null);
      }
      return;
    }
    void fetchAndSetShippingOptions({
      deliveryMode,
      postalCode: guard.postalCode!,
      calculateShippingCost,
      // Use ref to read current value without declaring it as a dependency.
      // The ref always holds the latest value, so auto-select logic is correct.
      selectedShippingOption: selectedShippingOptionRef.current,
      setShippingOptions,
      setSelectedShippingOption,
      setLoading,
      setError,
    });
    // Intentionally excluded `selectedShippingOption` from deps — adding it
    // causes an infinite loop because fetchAndSetShippingOptions calls
    // setSelectedShippingOption, which changes selectedShippingOption, which
    // would re-trigger this effect endlessly.
  }, [
    customerInfo?.postalCode,
    deliveryMode,
    selectedAgency,
    calculateShippingCost,
    setSelectedShippingOption,
  ]);

  return { shippingOptions, loading, error, deliveryMode, setDeliveryMode };
}
