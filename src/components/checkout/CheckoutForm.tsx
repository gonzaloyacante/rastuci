"use client";

import { CreditCard, Lock, Shield } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/hooks/useSettings";
import {
  buildCheckoutCustomer,
  getErrorMessage,
  getPaymentDiscount,
  getPaymentMethodName,
  handleCheckoutSuccess,
  isCheckoutCustomerValid,
  parseCheckoutError,
} from "@/lib/checkoutUtils";
import { PAYMENT_METHODS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { StoreSettings } from "@/lib/validation/store";
import { CartItem } from "@/types/cart";

import { CustomerForm } from "./CustomerForm";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

function mapCartItemsForSummary(cartItems: CartItem[]) {
  return cartItems.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    price: item.product.price,
    image: Array.isArray(item.product.images)
      ? item.product.images[0]
      : undefined,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    onSale: item.product.onSale,
    salePrice: item.product.salePrice || undefined,
  }));
}

type PaymentMethodNoticeProps = {
  method: string;
  cashExpHours: number;
  transferExpHours: number;
};
function PaymentMethodNotice({
  method,
  cashExpHours,
  transferExpHours,
}: PaymentMethodNoticeProps) {
  if (method === PAYMENT_METHODS.CASH) {
    return (
      <div className="p-4 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 mt-4">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          💵 Pago en Efectivo (Solo Retiro)
        </h4>
        <p className="text-sm mb-3">
          Tu pedido quedará reservado por <strong>{cashExpHours} horas</strong>.
        </p>
        <p className="text-sm">
          Te enviaremos los detalles para retirar por el local.
        </p>
      </div>
    );
  }
  if (method === PAYMENT_METHODS.TRANSFER) {
    return (
      <div className="p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 mt-4">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          🏦 Transferencia Bancaria
        </h4>
        <p className="text-sm mb-3">
          Tendrás <strong>{transferExpHours} horas</strong> para enviar el
          comprobante.
        </p>
        <p className="text-sm">
          Al confirmar, recibirás los datos bancarios por email.
        </p>
      </div>
    );
  }
  if (method === PAYMENT_METHODS.MERCADOPAGO) {
    return (
      <div className="p-4 surface rounded-lg border border-muted mt-4">
        <div className="flex items-center justify-center gap-2 text-sm muted">
          <Shield className="w-4 h-4" />
          <span>
            Te redirigiremos a Mercado Pago para completar la compra de forma
            segura.
          </span>
        </div>
      </div>
    );
  }
  return null;
}

interface CheckoutFormProps {
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
}

// Validation schema for customer data
const customerSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  identificationType: z.string().min(1, "Selecciona un tipo"),
  identificationNumber: z
    .string()
    .min(6, "El número de documento parece muy corto")
    .regex(/^\d+$/, "Solo se permiten números"),
});

export function CheckoutForm({
  onPaymentSuccess: _onPaymentSuccess,
  onPaymentError,
}: CheckoutFormProps) {
  const {
    cartItems,
    getCartTotal,
    clearCart: _clearCart,
    getOrderSummary,
    selectedShippingOption,
    selectedAgency,
    customerInfo,
  } = useCart();
  const { show } = useToast();

  const { settings } = useSettings<StoreSettings>("store");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>(
    {}
  );

  const [customerData, setCustomerData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    identificationType: "DNI",
    identificationNumber: "",
  });

  const payments = settings?.payments;
  const dynamicDiscountPercent = getPaymentDiscount(
    selectedPaymentMethod,
    payments
  );
  const { shippingCost } = getOrderSummary();
  const subtotal = getCartTotal();
  const discountAmount = (subtotal * dynamicDiscountPercent) / 100;
  const currentTotal = subtotal + shippingCost - discountAmount;

  const cashExpHours = payments?.cashExpirationHours ?? 72;
  const transferExpHours = payments?.transferExpirationHours ?? 48;

  const discountsMap: Record<string, number> = {
    [PAYMENT_METHODS.CASH]: getPaymentDiscount(PAYMENT_METHODS.CASH, payments),
    [PAYMENT_METHODS.TRANSFER]: getPaymentDiscount(
      PAYMENT_METHODS.TRANSFER,
      payments
    ),
    [PAYMENT_METHODS.MERCADOPAGO]: getPaymentDiscount(
      PAYMENT_METHODS.MERCADOPAGO,
      payments
    ),
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      show({
        type: "error",
        title: "Error",
        message: "Selecciona un método de pago",
      });
      return;
    }
    if (!isCheckoutCustomerValid(customerData)) {
      const result = customerSchema.safeParse(customerData);
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.errors.forEach((issue) => {
          const key = String(issue.path[0] ?? "");
          if (key && !errs[key]) errs[key] = issue.message;
        });
        setCustomerErrors(errs);
        const firstKey = Object.keys(errs)[0];
        if (firstKey) {
          setTimeout(() => {
            const el =
              document.querySelector<HTMLElement>(`[name="${firstKey}"]`) ??
              document.getElementById(`customer-${firstKey}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            el?.focus();
          }, 50);
        }
      }
      show({
        type: "error",
        title: "Error",
        message: "Completa todos los datos personales",
      });
      return;
    }
    setCustomerErrors({});
    setIsProcessing(true);
    try {
      const customer = buildCheckoutCustomer(customerData, customerInfo);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
            size: item.size,
            color: item.color,
          })),
          customer,
          shippingMethod: selectedShippingOption,
          paymentMethod: selectedPaymentMethod,
          shippingAgency: selectedAgency ? { code: selectedAgency } : undefined,
          orderData: {
            total: currentTotal,
            subtotal,
            shippingCost,
            discount: discountAmount,
          },
        }),
      });
      if (!response.ok) throw await parseCheckoutError(response);
      const data = (await response.json()) as {
        success?: boolean;
        paymentMethod?: string;
        initPoint?: string;
        orderId?: string;
        message?: string;
      };
      if (data.success) handleCheckoutSuccess(data, show);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logger.error("Error en checkout", { error });
      show({ type: "error", title: "Error de pago", message: errorMessage });
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 muted mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Carrito vacío</h3>
        <p className="muted">Agrega productos para continuar con el pago</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario de pago */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Revisar Pedido</h2>
            <p className="muted">Confirma los detalles antes de pagar</p>
          </div>

          {/* Datos del cliente */}
          <CustomerForm
            data={customerData}
            onChange={setCustomerData}
            errors={customerErrors}
          />

          {/* Método de pago */}
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
            allowedMethods={[
              PAYMENT_METHODS.MERCADOPAGO,
              PAYMENT_METHODS.CASH,
              PAYMENT_METHODS.TRANSFER,
            ]}
            discounts={discountsMap}
          />

          {/* Messages based on Selection */}
          <PaymentMethodNotice
            method={selectedPaymentMethod}
            cashExpHours={cashExpHours}
            transferExpHours={transferExpHours}
          />

          <Button
            onClick={handlePayment}
            disabled={isProcessing || !selectedPaymentMethod}
            className="w-full h-12 text-lg font-medium mt-6"
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" color="white" className="mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Confirmar ${currentTotal.toLocaleString("es-AR")}
              </>
            )}
          </Button>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:sticky lg:top-6">
          <OrderSummaryCard
            items={mapCartItemsForSummary(cartItems)}
            customerInfo={{
              name:
                `${customerData.firstName} ${customerData.lastName}`.trim() ||
                customerInfo?.name ||
                "",
              email: customerData.email || customerInfo?.email || "",
              phone: customerInfo?.phone || "",
              address: customerInfo?.address || "",
              city: customerInfo?.city || "",
              province: customerInfo?.province || "",
              postalCode: customerInfo?.postalCode || "",
            }}
            shippingOption={{
              id: selectedShippingOption?.id || "",
              name: selectedShippingOption?.name || "Envío por definir",
              description: selectedShippingOption?.description || "",
              price: selectedShippingOption?.price || 0,
              estimatedDays: selectedShippingOption?.estimatedDays || "",
            }}
            paymentMethod={{
              id: selectedPaymentMethod,
              name: getPaymentMethodName(selectedPaymentMethod),
              description: selectedPaymentMethod ? "Procesamiento seguro" : "",
            }}
            subtotal={subtotal}
            shippingCost={shippingCost}
            discount={discountAmount}
            total={currentTotal}
            onEditStep={() => {}}
            agency={selectedAgency}
          />
        </div>
      </div>
    </div>
  );
}
