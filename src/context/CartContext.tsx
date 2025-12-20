"use client";

import { Agency } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import { analytics } from "@/lib/analytics"; // Import analytics singleton
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Interfaces para el checkout
export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  originalRate?: Record<string, unknown>; // Para guardar datos crudos de la API
  isFallback?: boolean; // Indica si es dato de fallback o de la API real
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresShipping?: boolean; // Nueva propiedad para determinar si requiere envío
}

export interface BillingOption {
  id: string;
  name: string;
  requiresDocument: boolean;
}

export interface Coupon {
  code: string;
  discount: number; // Porcentaje de descuento
  isValid: boolean;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  variantId?: string;
  sku?: string;
}

interface CartContextType {
  // Carrito y productos
  cartItems: CartItem[];
  addToCart: {
    (product: Product, quantity: number, size: string, color: string): void;
    (product: Product, size: string, color: string): void; // cantidad por defecto = 1
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

  // Checkout - Envío
  availableShippingOptions: ShippingOption[];
  selectedShippingOption: ShippingOption | null;
  setSelectedShippingOption: (option: ShippingOption) => void;
  calculateShippingCost: (
    postalCode: string,
    deliveredType?: "D" | "S"
  ) => Promise<ShippingOption[]>;

  // Checkout - Sucursal
  selectedAgency: Agency | null;
  setSelectedAgency: (agency: Agency | null) => void;
  getAgencies: (provinceCode: string) => Promise<Agency[]>;

  // Checkout - Pago
  availablePaymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;

  // Checkout - Facturación
  availableBillingOptions: BillingOption[];
  selectedBillingOption: BillingOption | null;
  setSelectedBillingOption: (option: BillingOption) => void;

  // Checkout - Cupones
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Checkout - Información del cliente
  customerInfo: CustomerInfo | null;
  updateCustomerInfo: (info: CustomerInfo) => void;

  // Checkout - Finalización
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Fallback seguro para usar los hooks fuera de un provider (no lanzar)
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
};

export const useCart = () => {
  const context = useContext(CartContext);
  return context === undefined ? _defaultCart : context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  // Estados del carrito
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  // Estados del checkout - Envío
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<ShippingOption | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  // Estados del checkout - Pago (Mercado Pago por defecto)
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>({
      id: "mercadopago",
      name: "MercadoPago",
      icon: "wallet",
      description: "Paga con Mercado Pago usando tu cuenta o billetera",
    });

  // Estados del checkout - Facturación
  const [selectedBillingOption, setSelectedBillingOption] =
    useState<BillingOption | null>(null);

  // Estados del checkout - Cupones
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Estados del checkout - Información del cliente
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Caches para mejorar performance
  const [shippingCache, setShippingCache] = useState<
    Record<string, ShippingOption[]>
  >({});
  const [agencyCache, setAgencyCache] = useState<Record<string, Agency[]>>({});

  // Opciones dinámicas desde API
  const [availableShippingOptions, setAvailableShippingOptions] = useState<
    ShippingOption[]
  >([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    PaymentMethod[]
  >([]);

  // Cargar opciones desde la API al montar el componente
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Cargar opciones de envío
        const shippingRes = await fetch("/api/settings/shipping-options");
        if (shippingRes.ok) {
          const shippingData = await shippingRes.json();
          if (shippingData.success && shippingData.data) {
            setAvailableShippingOptions(shippingData.data);
          }
        }

        // Cargar métodos de pago
        const paymentRes = await fetch("/api/settings/payment-methods");
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          if (paymentData.success && paymentData.data) {
            setAvailablePaymentMethods(paymentData.data);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  const availableBillingOptions: BillingOption[] = [
    {
      id: "consumer",
      name: "Consumidor Final",
      requiresDocument: false,
    },
    {
      id: "invoiceA",
      name: "Factura A",
      requiresDocument: true,
    },
    {
      id: "invoiceB",
      name: "Factura B",
      requiresDocument: true,
    },
  ];

  // Funciones del carrito memoizadas
  const addToCart = useCallback(
    (product: Product, a: number | string, b?: string, c?: string) => {
      // Normalizar argumentos: permitir (product, quantity, size, color) o (product, size, color)
      const isQuantityForm = typeof a === "number";
      const quantity = isQuantityForm ? (a as number) : 1;
      const size = isQuantityForm ? (b as string) : (a as string);
      const color = isQuantityForm ? (c as string) : (b as string);

      if (!size) {
        return;
      } // evitar inserciones inválidas (color puede ser opcional)

      // Track Add To Cart Event
      analytics.trackAddToCart(product.id, product.price * quantity);

      setCartItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.size === size &&
            item.color === color
        );

        if (existingItemIndex > -1) {
          // Actualizar cantidad del item existente
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          };
          return updatedItems;
        } else {
          // Buscar variante específica si existe
          const variant = product.variants?.find(
            (v) => v.color === color && v.size === size
          );

          // Agregar nuevo item
          return [
            ...prevItems,
            {
              product,
              quantity,
              size,
              color,
              variantId: variant?.id,
              sku: variant?.sku || undefined,
            },
          ];
        }
      });
    },
    []
  ) as unknown as CartContextType["addToCart"];

  const removeFromCart = useCallback(
    (productId: string, size: string, color: string) => {
      setCartItems((prevItems) =>
        prevItems.filter(
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

      setCartItems((prevItems) =>
        prevItems.map((item) =>
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
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      // Usar salePrice si existe y el producto está en oferta, sino usar price normal
      const effectivePrice =
        item.product.onSale && item.product.salePrice
          ? item.product.salePrice
          : item.product.price;
      return total + effectivePrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Persistencia en localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem("rastuci-cart");
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch {
      // noop
    }
    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage || typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem("rastuci-cart", JSON.stringify(cartItems));
    } catch {
      // noop
    }
  }, [cartItems, hasLoadedStorage]);

  const calculateShippingCost = useCallback(
    async (
      postalCode: string,
      deliveredType?: "D" | "S"
    ): Promise<ShippingOption[]> => {
      const cacheKey = `${postalCode}-${deliveredType || "D"}`;

      // Consultar cache antes de ir a la API
      if (shippingCache[cacheKey]) {
        logger.info("[CartContext] Usando cache para costo de envío", {
          cacheKey,
        });
        return shippingCache[cacheKey];
      }

      try {
        const response = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postalCode, deliveredType }),
        });

        const result = await response.json();

        if (result.success && result.options) {
          // Guardar en cache para la próxima vez
          setShippingCache((prev) => ({ ...prev, [cacheKey]: result.options }));
          return result.options;
        }
        throw new Error(result.error || "Error calculando envío");
      } catch (error) {
        logger.error("Error calculando costo de envío:", { error });
        throw error;
      }
    },
    [shippingCache]
  );

  // Checkout - Sucursal: Obtener con cache
  const getAgencies = useCallback(
    async (provinceCode: string): Promise<Agency[]> => {
      if (agencyCache[provinceCode]) {
        logger.info("[CartContext] Usando cache para sucursales", {
          provinceCode,
        });
        return agencyCache[provinceCode];
      }

      try {
        const customerId =
          process.env.NEXT_PUBLIC_CORREO_ARGENTINO_CUSTOMER_ID || "0001718183";
        const response = await fetch(
          `/api/shipping/agencies?provinceCode=${provinceCode}&customerId=${customerId}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          setAgencyCache((prev) => ({ ...prev, [provinceCode]: result.data }));
          return result.data;
        }
        return [];
      } catch (error) {
        logger.error("Error obteniendo sucursales:", { error });
        return [];
      }
    },
    [agencyCache]
  );

  // Checkout - Cupones
  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Error saving customer info:", { error });
      return false;
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const updateCustomerInfo = useCallback((info: CustomerInfo) => {
    setCustomerInfo(info);
  }, []);

  const getOrderSummary = useCallback(() => {
    const subtotal = getCartTotal();
    const shippingCost = selectedShippingOption?.price || 0;
    const discount = appliedCoupon
      ? (subtotal * appliedCoupon.discount) / 100
      : 0;
    const total = subtotal + shippingCost - discount;

    return {
      items: cartItems,
      subtotal,
      shippingCost,
      discount,
      total,
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

  const placeOrder = useCallback(async (): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
    redirectUrl?: string;
    paymentMethod?: string;
  }> => {
    try {
      // Validar que tengamos toda la información necesaria
      if (!customerInfo) {
        return {
          success: false,
          error: "Falta información del cliente",
        };
      }

      if (!selectedPaymentMethod) {
        return {
          success: false,
          error: "Por favor selecciona un método de pago",
        };
      }

      // Si es pago en efectivo, solo requiere pickup
      if (selectedPaymentMethod.id === "cash") {
        if (!selectedShippingOption || selectedShippingOption.id !== "pickup") {
          return {
            success: false,
            error: "Para pago en efectivo debe seleccionar retiro en tienda",
          };
        }
      } else {
        // Para otros métodos, requiere método de envío
        if (!selectedShippingOption) {
          return {
            success: false,
            error: "Por favor selecciona un método de envío",
          };
        }
      }

      const orderSummary = getOrderSummary();

      // Preparar datos para el API
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color,
        })),
        customer: customerInfo,
        shippingMethod: selectedShippingOption,
        shippingAgency: selectedAgency, // Add selected agency to order data
        paymentMethod: selectedPaymentMethod.id,
        orderData: {
          subtotal: orderSummary.subtotal,
          shippingCost: orderSummary.shippingCost,
          discount: orderSummary.discount,
          total: orderSummary.total,
        },
      };

      // Llamar al API de checkout
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Error al procesar el pedido",
        };
      }

      // Track purchase event
      analytics.trackPurchase(
        result.orderId || "temp_id",
        orderSummary.total,
        "ARS",
        result.items
      );

      // Si es MercadoPago, devolver URL de redirección
      if (result.paymentMethod === "mercadopago" && result.initPoint) {
        return {
          success: true,
          redirectUrl: result.initPoint,
          paymentMethod: "mercadopago",
        };
      }

      // Si es efectivo, devolver orderId
      if (result.paymentMethod === "cash") {
        // Limpiar carrito después de pedido exitoso
        clearCart();
        return {
          success: true,
          orderId: result.orderId,
          paymentMethod: "cash",
        };
      }

      return {
        success: true,
        orderId: result.orderId,
      };
    } catch (error) {
      logger.error("Error al procesar pedido", { error });
      return {
        success: false,
        error: "Error de conexión. Por favor intenta nuevamente.",
      };
    }
  }, [
    customerInfo,
    selectedPaymentMethod,
    selectedShippingOption,
    cartItems,
    getOrderSummary,
    clearCart,
    selectedAgency,
  ]);

  const value: CartContextType = useMemo(
    () => ({
      // Carrito y productos
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemCount,

      // Checkout - Envío
      availableShippingOptions,
      selectedShippingOption,
      setSelectedShippingOption,
      calculateShippingCost,

      // Checkout - Sucursal
      selectedAgency,
      setSelectedAgency,
      getAgencies,

      // Checkout - Pago
      availablePaymentMethods,
      selectedPaymentMethod,
      setSelectedPaymentMethod,

      // Checkout - Facturación
      availableBillingOptions,
      selectedBillingOption,
      setSelectedBillingOption,

      // Checkout - Cupones
      appliedCoupon,
      applyCoupon,
      removeCoupon,

      // Checkout - Información del cliente
      customerInfo,
      updateCustomerInfo,

      // Checkout - Finalización
      getOrderSummary,
      placeOrder,
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
      availableBillingOptions,
      selectedBillingOption,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      customerInfo,
      updateCustomerInfo,
      getOrderSummary,
      placeOrder,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
