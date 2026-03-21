"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useCartPersistence } from "@/hooks/useCartPersistence";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { useShippingCache } from "@/hooks/useShippingCache";
import { analytics } from "@/lib/analytics";
import { Agency } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import {
  AVAILABLE_BILLING_OPTIONS,
  BillingOption,
  CartItem,
  Coupon,
  CustomerInfo,
  DEFAULT_PAYMENT_METHOD,
  PaymentMethod,
  ShippingOption,
} from "@/types/cart";
import { formatCurrency } from "@/utils/formatters";

// Re-exportar todos los tipos desde @/types/cart para compatibilidad hacia atrás
export type {
  BillingOption,
  CartItem,
  Coupon,
  CustomerInfo,
  PaymentMethod,
  PlaceOrderResult,
  ShippingOption,
} from "@/types/cart";
export {
  AVAILABLE_BILLING_OPTIONS,
  DEFAULT_PAYMENT_METHOD,
} from "@/types/cart";

// ─── Tipo del contexto ───────────────────────────────────────────────────────

interface CartContextType {
  cartItems: CartItem[];
  addToCart: {
    (product: Product, quantity: number, size: string, color: string): void;
    (product: Product, size: string, color: string): void;
  };
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    newQuantity: number
  ) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;

  availableShippingOptions: ShippingOption[];
  selectedShippingOption: ShippingOption | null;
  setSelectedShippingOption: (option: ShippingOption) => void;
  calculateShippingCost: (
    postalCode: string,
    deliveredType?: "D" | "S"
  ) => Promise<ShippingOption[]>;

  selectedAgency: Agency | null;
  setSelectedAgency: (agency: Agency | null) => void;
  getAgencies: (provinceCode: string) => Promise<Agency[]>;

  availablePaymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;

  availableBillingOptions: BillingOption[];
  selectedBillingOption: BillingOption | null;
  setSelectedBillingOption: (option: BillingOption) => void;

  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  customerInfo: CustomerInfo | null;
  updateCustomerInfo: (info: CustomerInfo) => void;

  getOrderSummary: () => {
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    customer: CustomerInfo | null;
    shippingOption: ShippingOption | null;
    payment: PaymentMethod | null;
    billing: BillingOption | null;
  };
  placeOrder: () => Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
    redirectUrl?: string;
    paymentMethod?: string;
  }>;
  loadCheckoutSettings: () => Promise<void>;
}

// ─── Fallback seguro (fuera del Provider) ────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

const _defaultCart: CartContextType = {
  cartItems: [],
  addToCart: (() => {}) as unknown as CartContextType["addToCart"],
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getItemCount: () => 0,
  availableShippingOptions: [],
  selectedShippingOption: null,
  setSelectedShippingOption: () => {},
  calculateShippingCost: async () => [],
  selectedAgency: null,
  setSelectedAgency: () => {},
  getAgencies: async () => [],
  availablePaymentMethods: [],
  selectedPaymentMethod: null,
  setSelectedPaymentMethod: () => {},
  availableBillingOptions: [],
  selectedBillingOption: null,
  setSelectedBillingOption: () => {},
  appliedCoupon: null,
  applyCoupon: async () => false,
  removeCoupon: () => {},
  customerInfo: null,
  updateCustomerInfo: () => {},
  getOrderSummary: () => ({
    items: [],
    subtotal: 0,
    shippingCost: 0,
    discount: 0,
    total: 0,
    customer: null,
    shippingOption: null,
    payment: null,
    billing: null,
  }),
  placeOrder: async () => ({ success: false, error: "CartProvider missing" }),
  loadCheckoutSettings: async () => {},
};

export const useCart = () => {
  const context = useContext(CartContext);
  return context === undefined ? _defaultCart : context;
};

// ─── Helpers fuera del componente (bajan complejidad ciclomática) ─────────────

function getEffectivePrice(product: Product): number {
  return product.onSale && product.salePrice != null
    ? product.salePrice
    : product.price;
}

function upsertCartItem(
  prevItems: CartItem[],
  product: Product,
  quantity: number,
  size: string,
  color: string
): CartItem[] {
  const existingIdx = prevItems.findIndex(
    (item) =>
      item.product.id === product.id &&
      item.size === size &&
      item.color === color
  );

  if (existingIdx > -1) {
    const updated = [...prevItems];
    updated[existingIdx] = {
      ...updated[existingIdx],
      quantity: updated[existingIdx].quantity + quantity,
    };
    return updated;
  }

  const variant = product.variants?.find(
    (v) => v.color === color && v.size === size
  );
  return [
    ...prevItems,
    { product, quantity, size, color, variantId: variant?.id, sku: variant?.sku ?? undefined },
  ];
}

function validatePlaceOrder(
  customerInfo: CustomerInfo | null,
  selectedPaymentMethod: PaymentMethod | null,
  selectedShippingOption: ShippingOption | null
): string | null {
  if (!customerInfo) return "Falta información del cliente";
  if (!selectedPaymentMethod) return "Por favor selecciona un método de pago";
  if (selectedPaymentMethod.id === "cash") {
    if (!selectedShippingOption || selectedShippingOption.id !== "pickup") {
      return "Para pago en efectivo debe seleccionar retiro en tienda";
    }
  } else if (!selectedShippingOption) {
    return "Por favor selecciona un método de envío";
  }
  return null;
}

async function validateCouponResponse(
  result: { success: boolean; coupon?: Record<string, unknown> },
  getCurrentTotal: () => number
): Promise<Coupon | null> {
  if (!result.success || !result.coupon) return null;
  const coupon = result.coupon as unknown as Coupon & { minOrderTotal?: number };
  if (coupon.minOrderTotal != null && getCurrentTotal() < coupon.minOrderTotal) {
    throw new Error(
      `El monto mínimo para este cupón es ${formatCurrency(coupon.minOrderTotal)}`
    );
  }
  return coupon;
}

async function fetchCheckout(body: unknown): Promise<Response> {
  return fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}



interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  // Carrito
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Checkout — estado local mínimo
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<ShippingOption | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(DEFAULT_PAYMENT_METHOD);
  const [selectedBillingOption, setSelectedBillingOption] =
    useState<BillingOption | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Hooks extraídos
  const { hasLoadedStorage } = useCartPersistence(
    cartItems,
    appliedCoupon,
    setCartItems,
    setAppliedCoupon
  );
  const {
    availableShippingOptions,
    calculateShippingCost,
    getAgencies,
  } = useShippingCache();
  const { availablePaymentMethods, loadCheckoutSettings } =
    useCheckoutSettings();

  // ─── Operaciones del carrito ──────────────────────────────────────────────

  const addToCart = useCallback(
    (product: Product, a: number | string, b?: string, c?: string) => {
      const isQuantityForm = typeof a === "number";
      const quantity = isQuantityForm ? (a as number) : 1;
      const size = isQuantityForm ? (b as string) : (a as string);
      const color = isQuantityForm ? (c as string) : (b as string);

      if (!size) return;

      analytics.trackAddToCart(product.id, getEffectivePrice(product) * quantity);
      setCartItems((prev) => upsertCartItem(prev, product, quantity, size, color));
    },
    []
  ) as unknown as CartContextType["addToCart"];

  const removeFromCart = useCallback(
    (productId: string, size: string, color: string) => {
      setCartItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.size === size &&
              item.color === color
            )
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(productId, size, color);
        return;
      }
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === productId &&
          item.size === size &&
          item.color === color
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedCoupon(null);
  }, []);

  const getCartTotal = useCallback(
    () =>
      cartItems.reduce(
        (total, item) => total + getEffectivePrice(item.product) * item.quantity,
        0
      ),
    [cartItems]
  );

  const getItemCount = useCallback(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  // ─── Cupones ──────────────────────────────────────────────────────────────

  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const err = await response.json();
            throw new Error(err.error || "Error validando cupón");
          }
          throw new Error(`Error validando cupón: HTTP ${response.status}`);
        }

        const result = await response.json();
        const coupon = await validateCouponResponse(result, getCartTotal);
        if (coupon) {
          setAppliedCoupon(coupon);
          return true;
        }
        return false;
      } catch (error) {
        logger.error("Error al aplicar cupón:", { error });
        throw error;
      }
    },
    [getCartTotal]
  );

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  // ─── Resumen y finalización ───────────────────────────────────────────────

  const updateCustomerInfo = useCallback(
    (info: CustomerInfo) => setCustomerInfo(info),
    []
  );

  const getOrderSummary = useCallback(() => {
    const subtotal = getCartTotal();
    const shippingCost = selectedShippingOption?.price ?? 0;
    const discount = appliedCoupon
      ? appliedCoupon.discountType === "FIXED"
        ? Math.min(appliedCoupon.discount, subtotal)
        : (subtotal * appliedCoupon.discount) / 100
      : 0;
    return {
      items: cartItems,
      subtotal,
      shippingCost,
      discount,
      total: subtotal + shippingCost - discount,
      customer: customerInfo,
      shippingOption: selectedShippingOption,
      payment: selectedPaymentMethod,
      billing: selectedBillingOption,
    };
  }, [
    cartItems,
    getCartTotal,
    selectedShippingOption,
    appliedCoupon,
    customerInfo,
    selectedPaymentMethod,
    selectedBillingOption,
  ]);

  const placeOrder = useCallback(async () => {
    const validationError = validatePlaceOrder(
      customerInfo,
      selectedPaymentMethod,
      selectedShippingOption
    );
    if (validationError) return { success: false, error: validationError };

    const orderSummary = getOrderSummary();

    try {
      const response = await fetchCheckout({
        items: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: getEffectivePrice(item.product),
          size: item.size,
          color: item.color,
        })),
        customer: customerInfo,
        shippingMethod: selectedShippingOption,
        shippingAgency: selectedAgency,
        paymentMethod: selectedPaymentMethod!.id,
        couponCode: appliedCoupon?.code,
        orderData: {
          subtotal: orderSummary.subtotal,
          shippingCost: orderSummary.shippingCost,
          discount: orderSummary.discount,
          total: orderSummary.total,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const err = await response.json();
          return { success: false, error: err.error || "Error al procesar el pedido" };
        }
        return { success: false, error: `Error de red: HTTP ${response.status}` };
      }

      const result = await response.json();
      if (!result.success) {
        return { success: false, error: result.error || "Error al procesar el pedido" };
      }

      analytics.trackPurchase(result.orderId || "temp_id", orderSummary.total, "ARS", result.items);

      if (result.paymentMethod === "mercadopago" && result.initPoint) {
        return { success: true, redirectUrl: result.initPoint, paymentMethod: "mercadopago" };
      }

      if (result.paymentMethod === "cash" || result.paymentMethod === "transfer") {
        clearCart();
        return { success: true, orderId: result.orderId, paymentMethod: result.paymentMethod };
      }

      return { success: true, orderId: result.orderId };
    } catch (error) {
      logger.error("Error al procesar pedido", { error });
      return { success: false, error: "Error de conexión. Por favor intenta nuevamente." };
    }
  }, [
    customerInfo,
    selectedPaymentMethod,
    selectedShippingOption,
    cartItems,
    getOrderSummary,
    clearCart,
    selectedAgency,
    appliedCoupon,
  ]);

  // ─── Contexto ─────────────────────────────────────────────────────────────

  const value: CartContextType = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemCount,
      availableShippingOptions,
      selectedShippingOption,
      setSelectedShippingOption,
      calculateShippingCost,
      selectedAgency,
      setSelectedAgency,
      getAgencies,
      availablePaymentMethods,
      selectedPaymentMethod,
      setSelectedPaymentMethod,
      availableBillingOptions: AVAILABLE_BILLING_OPTIONS,
      selectedBillingOption,
      setSelectedBillingOption,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      customerInfo,
      updateCustomerInfo,
      getOrderSummary,
      placeOrder,
      loadCheckoutSettings,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemCount,
      availableShippingOptions,
      selectedShippingOption,
      calculateShippingCost,
      selectedAgency,
      getAgencies,
      availablePaymentMethods,
      selectedPaymentMethod,
      selectedBillingOption,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      customerInfo,
      updateCustomerInfo,
      getOrderSummary,
      placeOrder,
      loadCheckoutSettings,
    ]
  );

  // Suprimir warning de hydration durante la carga inicial de localStorage
  if (!hasLoadedStorage) return null;

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
