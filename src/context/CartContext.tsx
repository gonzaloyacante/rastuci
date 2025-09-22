"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Product } from "@/types";

// Interfaces para el checkout
export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
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
  calculateShippingCost: (postalCode: string) => Promise<ShippingOption[]>;

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
  }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
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

  // Opciones disponibles (estáticas por ahora)
  const availableShippingOptions: ShippingOption[] = useMemo(() => [
    {
      id: "pickup",
      name: "Retiro en tienda",
      description: "Retira tu pedido en nuestra tienda física",
      price: 0,
      estimatedDays: "Inmediato",
    },
    {
      id: "standard",
      name: "Envío estándar",
      description: "Envío a domicilio en 3-5 días hábiles",
      price: 1500,
      estimatedDays: "3-5 días",
    },
    {
      id: "express",
      name: "Envío express",
      description: "Envío prioritario en 24-48 horas",
      price: 2500,
      estimatedDays: "24-48 horas",
    },
  ], []);

  const availablePaymentMethods: PaymentMethod[] = [
    {
      id: "mercadopago",
      name: "MercadoPago",
      icon: "wallet",
      description: "Paga con Mercado Pago usando tu cuenta o billetera",
    },
  ];

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
  const addToCart = (useCallback(
    (
      product: Product,
      a: number | string,
      b?: string,
      c?: string
    ) => {
      // Normalizar argumentos: permitir (product, quantity, size, color) o (product, size, color)
      const isQuantityForm = typeof a === "number";
      const quantity = isQuantityForm ? (a as number) : 1;
      const size = isQuantityForm ? (b as string) : (a as string);
      const color = isQuantityForm ? (c as string) : (b as string);

      if (!size) return; // evitar inserciones inválidas (color puede ser opcional)

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
          // Agregar nuevo item
          return [...prevItems, { product, quantity, size, color }];
        }
      });
    },
    []
  ) as unknown) as CartContextType["addToCart"];

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
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Persistencia en localStorage
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    try {
      localStorage.setItem("rastuci-cart", JSON.stringify(cartItems));
    } catch {
      // noop
    }
  }, [cartItems, hasLoadedStorage]);

  // Envío - Implementación del cálculo por código postal
  const calculateShippingCost = useCallback(
    async (postalCode: string): Promise<ShippingOption[]> => {
      // Validar el código postal de Argentina (formato general 4 dígitos o 1 letra + 4 dígitos)
      const postalCodeRegex = /^[A-Z]?\d{4}$/i;
      if (!postalCodeRegex.test(postalCode)) {
        throw new Error(
          "Código postal inválido. Debe tener 4 dígitos, o una letra seguida de 4 dígitos."
        );
      }

      // Lógica de cálculo de costo de envío según código postal
      // Simplificado: Códigos postales de CABA (1000-1499) tienen precio especial
      // Códigos del GBA (1500-1999) tienen otro precio
      // Resto del país tiene precio estándar pero varía por región

      const numericCode = parseInt(postalCode.replace(/[A-Z]/i, ""));
      let options = [...availableShippingOptions];

      // CABA
      if (numericCode >= 1000 && numericCode <= 1499) {
        options = options.map((option) => {
          if (option.id === "standard") {
            return { ...option, price: 800, estimatedDays: "2-3 días" };
          }
          if (option.id === "express") {
            return { ...option, price: 1500, estimatedDays: "24 horas" };
          }
          return option;
        });
      }
      // GBA
      else if (numericCode >= 1500 && numericCode <= 1999) {
        options = options.map((option) => {
          if (option.id === "standard") {
            return { ...option, price: 1200, estimatedDays: "2-4 días" };
          }
          if (option.id === "express") {
            return { ...option, price: 2000, estimatedDays: "24-48 horas" };
          }
          return option;
        });
      }
      // Provincias cercanas (Santa Fe, Córdoba, Entre Ríos)
      else if (
        (numericCode >= 2000 && numericCode <= 2999) ||
        (numericCode >= 3000 && numericCode <= 3599) ||
        (numericCode >= 5000 && numericCode <= 5999)
      ) {
        options = options.map((option) => {
          if (option.id === "standard") {
            return { ...option, price: 1800, estimatedDays: "3-5 días" };
          }
          if (option.id === "express") {
            return { ...option, price: 3000, estimatedDays: "48-72 horas" };
          }
          return option;
        });
      }
      // Resto del país
      else {
        options = options.map((option) => {
          if (option.id === "standard") {
            return { ...option, price: 2500, estimatedDays: "5-7 días" };
          }
          if (option.id === "express") {
            return { ...option, price: 4000, estimatedDays: "72-96 horas" };
          }
          return option;
        });
      }

      return options;
    },
    [availableShippingOptions]
  );

  // Checkout - Cupones
  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    // Simular validación de cupón
    // En producción, esto se haría contra una API
    const validCoupons = [
      { code: "WELCOME10", discount: 10 },
      { code: "SUMMER20", discount: 20 },
      { code: "FREESHIP", discount: 0 }, // Descuento especial para envío
    ];

    const coupon = validCoupons.find((c) => c.code === code.toUpperCase());
    if (coupon) {
      setAppliedCoupon({
        code: coupon.code,
        discount: coupon.discount,
        isValid: true,
      });
      return true;
    }
    return false;
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
  }> => {
    try {
      // Simular creación de pedido
      // En producción, esto se haría contra una API
      const orderId = `ORD-${Date.now()}`;

      // Simular delay de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        orderId,
      };
    } catch {
      return {
        success: false,
        error: "Error al procesar el pedido",
      };
    }
  }, []);

  const value: CartContextType = {
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
