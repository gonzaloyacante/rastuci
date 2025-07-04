"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Product } from "@/types";

// Tipos para el proceso de checkout
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

// Definimos el tipo para un item del carrito
export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

// Definimos el tipo para el contexto del carrito
interface CartContextType {
  // Carrito y productos
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity: number,
    size: string,
    color: string
  ) => void;
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

// Creamos el contexto con un valor por defecto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Creamos el hook para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Creamos el proveedor del contexto del carrito
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  // Estado del carrito
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Estados para checkout
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<ShippingOption | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [selectedBillingOption, setSelectedBillingOption] =
    useState<BillingOption | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Opciones disponibles
  const availableShippingOptions: ShippingOption[] = [
    {
      id: "standard",
      name: "Envío Estándar",
      description: "Entrega en 3-5 días hábiles",
      price: 1200,
      estimatedDays: "3-5 días",
    },
    {
      id: "express",
      name: "Envío Express",
      description: "Entrega en 24-48 horas",
      price: 2500,
      estimatedDays: "1-2 días",
    },
    {
      id: "pickup",
      name: "Retirar en Tienda",
      description: "Sin costo adicional",
      price: 0,
      estimatedDays: "Inmediato",
    },
  ];

  const availablePaymentMethods: PaymentMethod[] = [
    {
      id: "credit",
      name: "Tarjeta de Crédito",
      icon: "credit-card",
      description: "Visa, Mastercard, American Express",
    },
    {
      id: "debit",
      name: "Tarjeta de Débito",
      icon: "credit-card",
      description: "Visa Débito, Maestro",
    },
    {
      id: "mercadopago",
      name: "MercadoPago",
      icon: "wallet",
      description: "Pago con cuenta de MercadoPago",
    },
    {
      id: "transfer",
      name: "Transferencia Bancaria",
      icon: "bank",
      description: "Transferencia a nuestra cuenta",
    },
    {
      id: "cash",
      name: "Efectivo en Entrega",
      icon: "dollar-sign",
      description: "Pago al recibir el producto",
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

  // Cargar el carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      // Cargar carrito actual
      const storedCart = localStorage.getItem("rastuci_cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        // Verificar que el carrito tenga la estructura correcta para evitar errores
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          console.warn(
            "Invalid cart format in localStorage, initializing empty cart"
          );
          setCartItems([]);
        }
      }

      // Cargar información del cliente
      const storedCustomerInfo = localStorage.getItem("rastuci_customer_info");
      if (storedCustomerInfo) {
        setCustomerInfo(JSON.parse(storedCustomerInfo));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      setCartItems([]);
    }
  }, []);

  // Guardar el carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("rastuci_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Guardar información del cliente
  useEffect(() => {
    if (customerInfo) {
      localStorage.setItem(
        "rastuci_customer_info",
        JSON.stringify(customerInfo)
      );
    }
  }, [customerInfo]);

  const addToCart = (
    product: Product,
    quantity: number,
    size: string,
    color: string
  ) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.color === color
      );

      if (existingItemIndex > -1) {
        // Si el item ya existe, actualizamos la cantidad
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Si es un item nuevo, lo agregamos al carrito
        return [...prevItems, { product, quantity, size, color }];
      }
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
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
  };

  const updateQuantity = (
    productId: string,
    size: string,
    color: string,
    newQuantity: number
  ) => {
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
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Envío - Implementación del cálculo por código postal
  const calculateShippingCost = async (
    postalCode: string
  ): Promise<ShippingOption[]> => {
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
  };

  // Checkout - Cupones
  const applyCoupon = async (code: string): Promise<boolean> => {
    // Lista de cupones válidos (en producción, esto vendría de una base de datos)
    const validCoupons: Record<string, number> = {
      BIENVENIDO10: 10,
      VERANO20: 20,
      PRIMAVERA15: 15,
      RASTUCI25: 25,
    };

    // Verificar si el cupón es válido
    if (code.toUpperCase() in validCoupons) {
      const discount = validCoupons[code.toUpperCase()];
      setAppliedCoupon({
        code: code.toUpperCase(),
        discount,
        isValid: true,
      });
      return true;
    }

    // Si no es válido, limpiar cualquier cupón existente
    setAppliedCoupon(null);
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Información del cliente
  const updateCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  // Resumen del pedido
  const getOrderSummary = () => {
    const subtotal = getCartTotal();
    const shippingCost = selectedShippingOption?.price || 0;

    // Calcular descuento si hay un cupón aplicado
    const discount = appliedCoupon
      ? Math.round((subtotal * appliedCoupon.discount) / 100)
      : 0;

    // Calcular total final
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
  };

  // Finalizar pedido
  const placeOrder = async (): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }> => {
    try {
      // Validar que tengamos toda la información necesaria
      if (!customerInfo) {
        return {
          success: false,
          error: "Falta información del cliente",
        };
      }

      if (!selectedShippingOption) {
        return {
          success: false,
          error: "Por favor selecciona un método de envío",
        };
      }

      if (!selectedPaymentMethod) {
        return {
          success: false,
          error: "Por favor selecciona un método de pago",
        };
      }

      // Verificar si se requiere información de facturación
      if (
        selectedBillingOption?.requiresDocument &&
        (!customerInfo.documentType || !customerInfo.documentNumber)
      ) {
        return {
          success: false,
          error:
            "La información de facturación requiere un número de documento",
        };
      }

      // En un entorno real, aquí se enviaría la información a la API
      // para crear el pedido en la base de datos

      // Simular una respuesta exitosa
      const orderId = `ORD-${Date.now()}`;

      // Limpiar el carrito después de completar el pedido
      clearCart();
      setSelectedShippingOption(null);
      setSelectedPaymentMethod(null);
      setSelectedBillingOption(null);
      setAppliedCoupon(null);

      return {
        success: true,
        orderId,
      };
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      return {
        success: false,
        error:
          "Ocurrió un error al procesar tu pedido. Por favor intenta nuevamente.",
      };
    }
  };

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
